import { PROTO } from './opcode';
import { Reader } from './reader';

export class Parser {
    private _reader: Reader;

    constructor(buffer: Uint8Array | Int8Array | Uint8ClampedArray) {
        this._reader = new Reader(buffer);
    }

    load() {
        const reader = this._reader;
        while (reader.position < reader.length) {
            const opcode = reader.byte();
            console.log((reader.position - 1).toString() + ' ' + opcode);
            switch (opcode) {
                case PROTO: {
                    const version = reader.byte();
                    if (version > 4) {
                        throw new Error("Unsupported protocol version '" + version + "'.");
                    }
                    break;
                }
                default:
                    throw new Error("Unknown opcode '" + opcode + "'.");
            }
        }
        throw new Error('Unexpected end of file.');
    }
}
