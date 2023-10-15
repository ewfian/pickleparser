type Encoding = 'ascii' | 'utf-8';

export interface IReader {
    byte(): number;
    bytes(length: number): Uint8Array | Int8Array | Uint8ClampedArray;
    uint16(): number;
    int32(): number;
    uint32(): number;
    uint64(): number;
    float64(): number;
    skip(offset: number): void;
    string(size: number, encoding: Encoding): string;
    line(): string;
    hasNext(): boolean;
}

export class BufferReader implements IReader {
    private readonly _buffer: Uint8Array | Int8Array | Uint8ClampedArray;
    private readonly _dataView: DataView;
    private readonly _utf8Decoder = new TextDecoder('utf-8');
    private readonly _asciiDecoder = new TextDecoder('ascii');

    private _position: number;

    constructor(buffer: Uint8Array | Int8Array | Uint8ClampedArray) {
        this._buffer = buffer;
        this._dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this._position = 0;
    }

    get length() {
        return this._buffer.byteLength;
    }

    get position() {
        return this._position;
    }

    byte() {
        const position = this._position;
        this.skip(1);
        return this._dataView.getUint8(position);
    }

    bytes(length: number) {
        const position = this._position;
        this.skip(length);
        return this._buffer.subarray(position, this._position);
    }

    uint16() {
        const position = this.position;
        this.skip(2);
        return this._dataView.getUint16(position, true);
    }

    int32() {
        const position = this.position;
        this.skip(4);
        return this._dataView.getInt32(position, true);
    }

    uint32() {
        const position = this.position;
        this.skip(4);
        return this._dataView.getUint32(position, true);
    }

    uint64() {
        const position = this.position;
        this.skip(8);
        // split 64-bit number into two 32-bit parts
        const left = this._dataView.getUint32(position, true);
        const right = this._dataView.getUint32(position + 4, true);
        // combine the two 32-bit values
        const number = left + 2 ** 32 * right;
        if (!Number.isSafeInteger(number)) {
            console.warn(number, 'exceeds MAX_SAFE_INTEGER. Precision may be lost');
        }
        // new Uint8Array([0xff, 0x00, 0x00, 0x00,  0x00, 0x00, 0x00, 0x00]) => 255,
        // new Uint8Array([0xff, 0xff, 0x00, 0x00,  0x00, 0x00, 0x00, 0x00]) => 65535,
        // new Uint8Array([0xff, 0xff, 0xff, 0xff,  0x00, 0x00, 0x00, 0x00]) => 4294967295,
        // new Uint8Array([0x00, 0x00, 0x00, 0x00,  0x01, 0x00, 0x00, 0x00]) => 4294967296,
        // new Uint8Array([0x00, 0x00, 0x00, 0x00,  0x00, 0x01, 0x00, 0x00]) => 1099511627776,
        // new Uint8Array([0x00, 0x00, 0x00, 0x00,  0x00, 0x00, 0x01, 0x00]) => 281474976710656,
        // new Uint8Array([0xff, 0xff, 0xff, 0xff,  0xff, 0xff, 0x1f, 0x00]) => 9007199254740991, // maximum precision
        return number;
    }

    float64() {
        const position = this.position;
        this.skip(8);
        return this._dataView.getFloat64(position, false);
    }

    skip(offset: number) {
        this._position += offset;
        if (this._position > this._buffer.length) {
            throw new Error(
                'Expected ' +
                    (this._position - this._buffer.length) +
                    ' more bytes. The file might be corrupted. Unexpected end of file.',
            );
        }
    }

    string(size: number, encoding: Encoding) {
        const data = this.bytes(size);
        return encoding == 'utf-8' ? this._utf8Decoder.decode(data) : this._asciiDecoder.decode(data);
    }

    line() {
        const index = this._buffer.indexOf(0x0a /** LF(\\n) */, this._position);
        if (index == -1) {
            throw new Error('Could not find end of line.');
        }
        const size = index - this._position;
        const text = this.string(size, 'ascii');
        this.skip(1);
        return text;
    }

    hasNext() {
        return this.position < this.length;
    }
}

export function readUint64(data: Uint8Array | Int8Array | Uint8ClampedArray) {
    if (data.length > 8) {
        throw new Error('Value too large to unpickling');
    }
    // Padding to 8 bytes
    const buffer = new ArrayBuffer(8);
    const uint8 = new Uint8Array(buffer);
    uint8.set(data);
    const subReader = new BufferReader(uint8);
    const number = subReader.uint64();
    return number;
}

export function readUint64WithBigInt(data: Uint8Array | Int8Array | Uint8ClampedArray) {
    let fixedLength = 0;
    let partCount = 0;
    while (fixedLength < data.length) {
        fixedLength += 4;
        partCount += 1;
    }
    const buffer = new ArrayBuffer(fixedLength);
    const uint8 = new Uint8Array(buffer);
    uint8.set(data);
    const view = new DataView(buffer, 0, fixedLength);
    let number = BigInt(0);
    for (let partIndex = 0; partIndex < partCount; partIndex++) {
        const part = BigInt(view.getUint32(partIndex * 4, true));
        number |= part << BigInt(partIndex * 32);
    }
    return number;
}
