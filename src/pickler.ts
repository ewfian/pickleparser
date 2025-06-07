import { OP } from './opcode';
import { IWriter } from './writer';
import { BufferWriter } from './writer';

const DefaultOptions: PicklerOptions = {
    protocol: 5,
};

// Constants for number ranges
const ONE_BYTE_LIMIT = 2 ** (1 * 8) - 1;
const TWO_BYTE_LIMIT = 2 ** (2 * 8) - 1;
const FOUR_BYTE_LIMIT = 2 ** (4 * 8) - 1;
const LONG1_LIMIT_BYTES = 255;

/**
 * Serializes a JavaScript object into a Python pickle format byte stream.
 */
export class Pickler {
    readonly #options: PicklerOptions;
    readonly #writer: IWriter;
    readonly #memo: Map<unknown, number>;

    public constructor(options?: Partial<PicklerOptions>) {
        this.#options = { ...DefaultOptions, ...options };
        this.#writer = new BufferWriter();
        this.#memo = new Map();
    }

    public dump(obj: unknown): Uint8Array {
        this.writeProto();
        this.write(obj);
        this.#writer.byte(OP.STOP);
        return this.#writer.getBuffer();
    }

    private writeProto(): void {
        const protocol = this.#options.protocol;
        if (protocol < 0 || protocol > 5) {
            throw new Error(`Invalid protocol version: ${protocol}`);
        }

        if (protocol >= 2) {
            this.#writer.byte(OP.PROTO).byte(protocol);
        }
    }

    private write(obj: unknown): void {
        // Check memo first for any non-primitive object
        if ((typeof obj === 'object' && obj !== null) || typeof obj === 'function') {
            const memoId = this.#memo.get(obj);
            if (memoId !== undefined) {
                this.writeGet(memoId);
                return;
            }
        }

        if (obj === null) {
            this.#writer.byte(OP.NONE);
            return;
        }

        if (Array.isArray(obj)) {
            this.writeList(obj);
            return;
        }

        if (obj instanceof Map) {
            this.writeDict(obj);
            return;
        }

        switch (typeof obj) {
            case 'boolean':
                if (this.#options.protocol >= 2) {
                    this.#writer.byte(obj ? OP.NEWTRUE : OP.NEWFALSE);
                } else {
                    this.#writer.byte(OP.INT).line(obj ? '01' : '00');
                }
                return;

            case 'number':
                if (Number.isInteger(obj)) {
                    if (obj >= 0) {
                        if (obj <= ONE_BYTE_LIMIT) {
                            // OP.BININT1: 1-byte unsigned integer
                            this.#writer.byte(OP.BININT1).byte(obj);
                            return;
                        }
                        if (obj <= TWO_BYTE_LIMIT) {
                            // OP.BININT2: 2-byte unsigned integer
                            this.#writer.byte(OP.BININT2).uint16(obj);
                            return;
                        }
                    }
                    this.#writer.byte(OP.BININT).int32(obj);
                } else {
                    this.#writer.byte(OP.BINFLOAT).float64(obj);
                }
                return;

            case 'bigint':
                this.writeBigInt(obj);
                return;

            case 'string': {
                const data = this.#writer.encodeUtf8(obj); // Let's add a helper to writer
                const len = data.length;

                if (this.#options.protocol >= 4) {
                    if (len <= ONE_BYTE_LIMIT) {
                        this.#writer.byte(OP.SHORT_BINUNICODE).byte(len).bytes(data);
                    } else if (len <= FOUR_BYTE_LIMIT) {
                        this.#writer.byte(OP.BINUNICODE).uint32(len).bytes(data);
                    } else {
                        this.#writer.byte(OP.BINUNICODE8).uint64(BigInt(len)).bytes(data);
                    }
                } else {
                    // Older protocols (0-3) only have BINUNICODE
                    if (len <= FOUR_BYTE_LIMIT) {
                        this.#writer.byte(OP.BINUNICODE).uint32(len).bytes(data);
                    } else {
                        throw new Error(`String too long for protocol ${this.#options.protocol}`);
                    }
                }
                return;
            }

            case 'object':
                if (Object.getPrototypeOf(obj) === Object.prototype) {
                    this.writeDict(obj);
                    return;
                }
                break; // Fall through to throw an error for other object types
        }

        throw new Error(`Unsupported object type: ${typeof obj}`);
    }

    private bigintToLittleEndianBytes(value: bigint): Uint8Array {
        if (value < 0) {
            throw new Error('Pickling negative BigInts is not supported yet.');
        }
        if (value === 0n) {
            return new Uint8Array(0);
        }

        let hex = value.toString(16);
        if (hex.length % 2) {
            hex = '0' + hex;
        }

        const len = hex.length / 2;
        const u8 = new Uint8Array(len);

        for (let i = 0, j = 0; i < len; i++) {
            j = (len - 1 - i) * 2; // Read from the end of the hex string (little-endian)
            u8[i] = parseInt(hex.substring(j, j + 2), 16);
        }

        return u8;
    }

    private writeBigInt(value: bigint): void {
        if (value >= 0 && value < 1n << 31n) {
            const num = Number(value);
            if (num <= ONE_BYTE_LIMIT) {
                this.#writer.byte(OP.BININT1).byte(num);
                return;
            }
            if (num <= TWO_BYTE_LIMIT) {
                this.#writer.byte(OP.BININT2).uint16(num);
                return;
            }
            this.#writer.byte(OP.BININT).int32(num);
            return;
        }

        // For larger numbers, use LONG1 or LONG4
        const bytes = this.bigintToLittleEndianBytes(value);

        if (bytes.length < LONG1_LIMIT_BYTES) {
            this.#writer.byte(OP.LONG1);
            this.#writer.byte(bytes.length);
            this.#writer.bytes(bytes);
        } else {
            this.#writer.byte(OP.LONG4);
            this.#writer.uint32(bytes.length);
            this.#writer.bytes(bytes);
        }
    }

    private writeList(list: unknown[]): void {
        if (this.#options.protocol >= 1) {
            this.#writer.byte(OP.EMPTY_LIST);
            this.memoize(list); // ВСЕГДА мемоизируем объект списка
            if (list.length > 0) {
                this.#writer.byte(OP.MARK);
                for (const item of list) {
                    this.write(item);
                }
                this.#writer.byte(OP.APPENDS);
            }
        } else {
            this.memoize(list);
            this.#writer.byte(OP.MARK);
            for (const item of list) {
                this.write(item);
            }
            this.#writer.byte(OP.LIST);
        }
    }

    private memoize(obj: unknown): void {
        const id = this.#memo.size;
        this.#memo.set(obj, id);

        // Choose the appropriate PUT opcode based on protocol and id size
        if (this.#options.protocol >= 4) {
            this.#writer.byte(OP.MEMOIZE);
        } else if (id <= ONE_BYTE_LIMIT) {
            this.#writer.byte(OP.BINPUT).byte(id);
        } else {
            this.#writer.byte(OP.LONG_BINPUT).uint32(id);
        }
    }

    private writeGet(id: number): void {
        // Choose the appropriate GET opcode based on id size
        if (id <= ONE_BYTE_LIMIT) {
            this.#writer.byte(OP.BINGET).byte(id);
        } else {
            this.#writer.byte(OP.LONG_BINGET).uint32(id);
        }
    }

    private writeDict(dict: object | Map<unknown, unknown>): void {
        const iterableEntries = [...(dict instanceof Map ? dict.entries() : Object.entries(dict))];

        if (this.#options.protocol >= 1) {
            this.#writer.byte(OP.EMPTY_DICT);
            this.memoize(dict);
            if (iterableEntries.length > 0) {
                this.#writer.byte(OP.MARK);
                for (const [key, value] of iterableEntries) {
                    this.write(key);
                    this.write(value);
                }
                this.#writer.byte(OP.SETITEMS);
            }
        } else {
            this.memoize(dict);
            this.#writer.byte(OP.MARK);
            for (const [key, value] of iterableEntries) {
                this.write(key);
                this.write(value);
            }
            this.#writer.byte(OP.DICT);
        }
    }
}

export interface PicklerOptions {
    protocol: number;
}
