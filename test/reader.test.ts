import { BufferReader, readUint64, readUint64WithBigInt } from '../src/reader';

describe('BufferReader', () => {
    describe('#constructor', () => {
        it('can be constructed', () => {
            const buffer = new Uint8Array();
            const reader = new BufferReader(buffer);
            expect(reader).toBeDefined();
        });

        it('has correct property', () => {
            const buffer = new Uint8Array([1, 2]);
            const reader = new BufferReader(buffer);
            expect(reader.length).toEqual(2);
            expect(reader.position).toEqual(0);
        });
    });

    describe('#IReader', () => {
        it('read byte', () => {
            const buffer = new Uint8Array([1]);
            const reader = new BufferReader(buffer);
            expect(reader.byte()).toEqual(1);
        });

        it('read bytes', () => {
            const buffer = new Uint8Array([1, 2, 3]);
            const reader = new BufferReader(buffer);
            expect(reader.bytes(2)).toStrictEqual(new Uint8Array([1, 2]));
        });

        it('read uint16', () => {
            const buffer = new Uint8Array([2, 3, 4]);
            const reader = new BufferReader(buffer);
            expect(reader.uint16()).toEqual(0x0302);
        });

        it('read int32', () => {
            const buffer = new Uint8Array([0x01, 0x80, 0xff, 0xff]);
            const reader = new BufferReader(buffer);
            expect(reader.int32()).toEqual(-32767);
        });

        it('read uint32', () => {
            const buffer = new Uint8Array([2, 3, 4, 5, 6]);
            const reader = new BufferReader(buffer);
            expect(reader.uint32()).toEqual(0x05040302);
        });

        it('read uint64 1 byte', () => {
            const buffer = new Uint8Array([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(255);
        });

        it('read uint64 2 bytes', () => {
            const buffer = new Uint8Array([0xff, 0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(65535);
        });

        it('read uint64 4 bytes', () => {
            const buffer = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(4294967295);
        });

        it('read uint64 5 bytes', () => {
            const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(4294967296);
        });

        it('read uint64 6 bytes', () => {
            const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(1099511627776);
        });

        it('read uint64 6 bytes', () => {
            const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(1099511627776);
        });

        it('read uint64 7 bytes', () => {
            const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(281474976710656);
        });

        it('read uint64 maximum precision', () => {
            const buffer = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(9007199254740991);
        });

        it('read uint64 excludes MAX_SAFE_INTEGER', () => {
            const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation();
            const buffer = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x20, 0x00]);
            const reader = new BufferReader(buffer);
            expect(reader.uint64()).toEqual(expect.any(Number));
            expect(console.warn).toHaveBeenLastCalledWith(
                expect.any(Number),
                'exceeds MAX_SAFE_INTEGER. Precision may be lost',
            );
            consoleWarnMock.mockRestore();
        });

        it('read float64', () => {
            const buffer = new Uint8Array([0x40, 0x09, 0x21, 0xfb, 0x54, 0x44, 0x2d, 0x18]);
            const reader = new BufferReader(buffer);
            expect(reader.float64()).toBeCloseTo(Math.PI, 12);
        });

        it('read string with utf-8', () => {
            const expected = '123qwe你好こんにちは./';
            const encoder = new TextEncoder();
            const buffer = encoder.encode(expected);
            const reader = new BufferReader(buffer);
            expect(reader.string(buffer.length, 'utf-8')).toBe(expected);
        });

        it('read string with ascii', () => {
            const expected = '123qwe./%$';
            const encoder = new TextEncoder();
            const buffer = encoder.encode(expected);
            const reader = new BufferReader(buffer);
            expect(reader.string(buffer.length, 'ascii')).toBe(expected);
        });

        it('read line', () => {
            const expected = '123qwe';
            const encoder = new TextEncoder();
            const buffer = encoder.encode(expected + '\n');
            const reader = new BufferReader(buffer);
            expect(reader.line()).toBe(expected);
        });

        it('read multiline', () => {
            const expected = '123qwe';
            const encoder = new TextEncoder();
            const buffer = encoder.encode(expected + '\n' + expected + '\n');
            const reader = new BufferReader(buffer);
            expect(reader.line()).toBe(expected);
            expect(reader.line()).toBe(expected);
        });

        it('read line with exception', () => {
            const expected = '123qwe';
            const encoder = new TextEncoder();
            const buffer = encoder.encode(expected);
            const reader = new BufferReader(buffer);
            expect(() => reader.line()).toThrow('Could not find end of line.');
        });

        it('skip', () => {
            const buffer = new Uint8Array([1, 2]);
            const reader = new BufferReader(buffer);
            reader.skip(1);
            expect(reader.byte()).toEqual(2);
        });

        it('skip with exception', () => {
            const buffer = new Uint8Array([1]);
            const reader = new BufferReader(buffer);
            expect(() => reader.skip(2)).toThrow(
                'Expected 1 more bytes. The file might be corrupted. Unexpected end of file.',
            );
        });

        it('hasNext', () => {
            const buffer = new Uint8Array([1]);
            const reader = new BufferReader(buffer);
            expect(reader.hasNext()).toEqual(true);
            reader.skip(1);
            expect(reader.hasNext()).toEqual(false);
        });
    });
});

describe('readUint64', () => {
    it('read data', () => {
        const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]);
        expect(readUint64(buffer)).toEqual(281474976710656);
    });

    it('read data with exception', () => {
        const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        expect(() => readUint64(buffer)).toThrow('Value too large to unpickling');
    });
});

describe('readUint64WithBigInt', () => {
    it('read data', () => {
        const buffer = new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
        expect(readUint64WithBigInt(buffer).toString()).toEqual('18446744073709551615');
    });
});
