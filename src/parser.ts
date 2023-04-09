import * as OP from './opcode';
import { Reader } from './reader';

export class Parser {
    private _reader: Reader;

    constructor(buffer: Uint8Array | Int8Array | Uint8ClampedArray) {
        this._reader = new Reader(buffer);
    }

    load() {
        const reader = this._reader;
        const stack = [];
        const memo = new Map();
        while (reader.hasNext()) {
            const opcode = reader.byte();
            console.log(`${(reader.position - 1).toString()} ${opcode} ${this.getOPName(opcode)}`);
            // console.log(`${stack} | ${Array.from(memo.entries())}`);
            switch (opcode) {
                case OP.PROTO: {
                    const version = reader.byte();
                    if (version > 4) {
                        throw new Error(`Unsupported protocol version '${version}'.`);
                    }
                    break;
                }
                case OP.FRAME:
                    reader.skip(8);
                    break;
                case OP.SHORT_BINUNICODE:
                    stack.push(reader.string(reader.byte(), 'utf-8'));
                    break;
                case OP.MEMOIZE:
                    memo.set(memo.size, stack[stack.length - 1]);
                    break;
                case OP.STACK_GLOBAL: {
                    const name = stack.pop();
                    const module = stack.pop();
                    const cls = this.resolveClass(name, module);
                    if (cls === undefined) {
                        throw new Error(`Cannot emulate global: ${module} ${name}`);
                    }
                    break;
                }
                default:
                    throw new Error(`Unknown opcode '${opcode}'.`);
            }
        }
        throw new Error('Unexpected end of file.');
    }
    resolveClass(name: string | undefined, module: string | undefined) {
        const cls = `${module}.${name}`;
        console.log('resolveClass: ', cls);
        return Dummy;
    }

    // Just for debug
    getOPName(opcode: number) {
        return Object.entries(OP).find((x) => x[1] === opcode)?.[0];
    }
}

class Dummy {
    constructor(name: string) {
        console.log(`Dummy.constructor:${name}`);
    }
}
