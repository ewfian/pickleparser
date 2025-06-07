import { BufferReader } from '../src/reader';
import { BufferWriter } from '../src/writer';

describe('BufferWriter', () => {
    let writer: BufferWriter;

    beforeEach(() => {
        writer = new BufferWriter(4);
    });

    const testCases = [
        ['byte', 0xff],
        ['bytes', new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])],
        ['uint16', 0x0302],
        ['int32', -32767],
        ['uint32', 0x05040302],
        ['uint64', 281474976710656n],
        ['float64', Math.PI],
        ['line', '123qwe'],
    ] as const;

    it.each(testCases)(
        'writes %s',
        <M extends keyof BufferWriter & keyof BufferReader>(
            method: M,
            value: Parameters<BufferWriter[M]>[0],
            ...args: unknown[]
        ) => {
            // @ts-expect-error args has correct type due to testCases structure
            writer[method](value, ...args);

            const reader = new BufferReader(writer.getBuffer());
            // @ts-expect-error same
            const result = reader[method](value.length); // length for bytes and string

            if (typeof value === 'number' && !Number.isInteger(value)) {
                expect(result).toBeCloseTo(value);
            } else if (method === 'uint64') {
                expect(BigInt(result as number)).toEqual(value);
            } else {
                expect(result).toEqual(value);
            }
        },
    );

    it('writes string with utf-8', () => {
        const expected = '123qwe你好こんにちは./';
        writer.string(expected, 'utf-8');

        const buffer = writer.getBuffer();
        const decoder = new TextDecoder('utf-8');
        expect(decoder.decode(buffer)).toBe(expected);
    });

    it('writes string with ascii', () => {
        const expected = '123qwe./%$';
        writer.string(expected, 'ascii');

        const buffer = writer.getBuffer();
        const decoder = new TextDecoder('ascii');
        expect(decoder.decode(buffer)).toBe(expected);
    });

    it('chains multiple write calls correctly', () => {
        writer.byte(0x01).uint16(0x0302).byte(0x04);
        expect(writer.getBuffer()).toStrictEqual(new Uint8Array([0x01, 0x02, 0x03, 0x04]));
    });

    it('dynamically resizes the buffer when needed', () => {
        const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        writer.bytes(data);

        expect(writer.getBuffer()).toStrictEqual(data);
    });
});
