import { Encoding } from './reader';
import { Sizes } from './sizes';

export interface IWriter {
    byte(value: number): IWriter;
    bytes(data: Uint8Array): IWriter;
    uint16(value: number): IWriter;
    int32(value: number): IWriter;
    uint32(value: number): IWriter;
    uint64(value: number | bigint): IWriter;
    float64(value: number): IWriter;
    line(text: string): IWriter;
    string(text: string, encoding: Encoding): IWriter;

    /** Returns the complete buffer containing all written data */
    getBuffer(): Uint8Array;
    encodeUtf8(text: string): Uint8Array;
}

/**
 * Class for writing data to a dynamically growing buffer.
 * The internal buffer automatically expands as more data is written.
 */
export class BufferWriter implements IWriter {
    #buffer: Uint8Array;
    #dataView: DataView;
    #position: number;

    readonly #utf8Encoder = new TextEncoder();

    public constructor(initialCapacity = 1024) {
        this.#buffer = new Uint8Array(initialCapacity);
        this.#dataView = new DataView(this.#buffer.buffer);
        this.#position = 0;
    }

    public byte(value: number): this {
        return this.write(Sizes.Byte, (pos) => this.#dataView.setUint8(pos, value));
    }

    public bytes(data: Uint8Array): this {
        return this.write(data.length, (pos) => this.#buffer.set(data, pos));
    }

    public uint16(value: number): this {
        return this.write(Sizes.UInt16, (pos) => this.#dataView.setUint16(pos, value, true));
    }

    public int32(value: number): this {
        return this.write(Sizes.Int32, (pos) => this.#dataView.setInt32(pos, value, true));
    }

    public uint32(value: number): this {
        return this.write(Sizes.UInt32, (pos) => this.#dataView.setUint32(pos, value, true));
    }

    public uint64(value: number | bigint): this {
        return this.write(Sizes.UInt64, (pos) => this.#dataView.setBigUint64(pos, BigInt(value), true));
    }

    public float64(value: number): this {
        return this.write(Sizes.Float64, (pos) => this.#dataView.setFloat64(pos, value, false));
    }

    public line(text: string): this {
        this.string(text, 'ascii');
        this.byte(0x0a); // LF
        return this;
    }

    public string(text: string, encoding: Encoding): this {
        if (encoding === 'utf-8') {
            const data = this.#utf8Encoder.encode(text);
            return this.bytes(data);
        } else {
            // 'ascii'
            return this.write(text.length, (pos) => {
                for (let i = 0; i < text.length; i++) {
                    this.#dataView.setUint8(pos + i, text.charCodeAt(i) & 0xff);
                }
            });
        }
    }

    public getBuffer(): Uint8Array {
        return this.#buffer.subarray(0, this.#position);
    }

    public encodeUtf8(text: string): Uint8Array {
        return this.#utf8Encoder.encode(text);
    }

    private ensureCapacity(requiredBytes: number): void {
        if (this.#position + requiredBytes < this.#buffer.byteLength) return;
        const newCapacity = Math.max(this.#buffer.byteLength * 2, this.#position + requiredBytes);
        const newBuffer = new Uint8Array(newCapacity);
        newBuffer.set(this.#buffer); // Copy old data
        this.#buffer = newBuffer;
        this.#dataView = new DataView(this.#buffer.buffer);
    }

    /**
     * Ensures capacity, executes the write function and advances the position.
     * @param size - The number of bytes to write.
     * @param writeFn - The function that performs the actual write operation at a given position.
     * @returns The writer instance for chaining.
     */
    private write(size: number, writeFn: (position: number) => void): this {
        this.ensureCapacity(size);
        writeFn(this.#position);
        this.#position += size;
        return this;
    }
}
