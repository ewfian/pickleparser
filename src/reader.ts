export class Reader {
    private _buffer: Uint8Array | Int8Array | Uint8ClampedArray;
    private _dataView: DataView;
    private _position: number;

    private _utf8Decoder = new TextDecoder('utf-8');
    private _asciiDecoder = new TextDecoder('ascii');

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

    float32() {
        const position = this.position;
        this.skip(4);
        return this._dataView.getFloat32(position, true);
    }

    float64() {
        const position = this.position;
        this.skip(8);
        return this._dataView.getFloat64(position, true);
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
        const index = this._buffer.indexOf(0x0a /** \n */, this._position);
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

export type Encoding = 'ascii' | 'utf-8';
