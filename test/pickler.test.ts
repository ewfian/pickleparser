import { Pickler } from '../src/pickler';
import { Parser } from '../src/parser';
import { OP } from '../src/opcode';

describe('Pickler', () => {
    const PROTOCOLS = [0, 1, 2, 3, 4, 5] as const;
    const PROTOCOLS_WITH_CYCLE_SUPPORT = PROTOCOLS.filter((p) => p >= 1);

    describe('#dump() - Primitives', () => {
        const primitiveValues = [
            ['null', null],
            ['boolean true', true],
            ['boolean false', false],
            ['a small positive integer (1 byte)', 123],
            ['a medium integer (2 bytes)', 1000],
            ['a larger integer (4 bytes)', 100000],
            ['a negative integer', -500500],
            ['zero', 0],
            ['a float', 3.14],
            ['an empty string', ''],
            ['an ASCII string', 'hello world'],
            ['a UTF-8 string', '你好, world!'],
            ['medium-size string', 'a'.repeat(500)],
            ['a big BigInt', 1234567891234567n],
            ['a small BigInt', 1n],
        ] as const;

        const primitiveTestCases = primitiveValues.flatMap(([testName, value]) => {
            const applicableProtocols = typeof value === 'bigint' ? PROTOCOLS_WITH_CYCLE_SUPPORT : PROTOCOLS;
            return applicableProtocols.map((protocol) => [testName, value, protocol] as const);
        });

        it.each(primitiveTestCases)('correctly pickles and unpickles %s (protocol %p)', (testName, value, protocol) => {
            // FIX: Explicitly cast protocol to number
            const pickler = new Pickler({ protocol: protocol as number });
            const parser = new Parser();

            const pickledData = pickler.dump(value);
            const unpickledData = parser.parse(pickledData);

            if (typeof value === 'bigint') {
                expect(BigInt(unpickledData as number | bigint)).toBe(value);
            } else {
                expect(unpickledData).toStrictEqual(value);
            }
        });
    });

    describe('#dump() - Containers', () => {
        const objectLikeCases = [
            ['an empty array', []],
            ['an array of numbers', [1, 2, 3]],
            ['an array of mixed primitives', ['a', null, true, 1.5]],
            ['a nested array', [1, [2, 3], 4]],
            ['an empty object', {}],
            ['a simple object', { a: 1, b: 'hello' }],
            ['a nested object', { a: 1, b: { c: 2 } }],
        ];

        it.each(objectLikeCases.flatMap(([name, value]) => PROTOCOLS.map((p) => [name, value, p])))(
            'correctly pickles/unpickles %s (protocol %p) to an Object',
            (name, value, protocol) => {
                // FIX: Explicitly cast protocol to number
                const pickler = new Pickler({ protocol: protocol as number });
                const parser = new Parser();

                const pickledData = pickler.dump(value);
                const unpickledData = parser.parse(pickledData);

                expect(unpickledData).toStrictEqual(value);
            },
        );

        const mapLikeCases = [
            ['an empty Map', new Map()],
            [
                'a Map with mixed key types',
                new Map<unknown, unknown>([
                    ['a', 1],
                    [2, 'b'],
                    [null, true],
                ]),
            ],
        ];

        it.each(mapLikeCases.flatMap(([name, value]) => PROTOCOLS.map((p) => [name, value, p])))(
            'correctly pickles/unpickles %s (protocol %p) to a Map',
            (name, value, protocol) => {
                // FIX: Explicitly cast protocol to number
                const pickler = new Pickler({ protocol: protocol as number });
                const parser = new Parser({ unpicklingTypeOfDictionary: 'Map' });

                const pickledData = pickler.dump(value);
                const unpickledData = parser.parse(pickledData);

                expect(unpickledData).toStrictEqual(value);
            },
        );

        it.each(PROTOCOLS_WITH_CYCLE_SUPPORT.map((p) => [p]))(
            'correctly pickles a self-referencing array (protocol %p)',
            (protocol) => {
                // FIX: Explicitly cast protocol to number
                const pickler = new Pickler({ protocol: protocol as number });
                const parser = new Parser();

                const arr: unknown[] = [1];
                arr.push(arr);

                const pickledData = pickler.dump(arr);
                const unpickledData = parser.parse<unknown[]>(pickledData);

                expect(unpickledData[0]).toBe(1);
                expect(unpickledData[1]).toBe(unpickledData);
            },
        );

        it.each(PROTOCOLS_WITH_CYCLE_SUPPORT.map((p) => [p]))(
            'correctly pickles a self-referencing object (protocol %p)',
            (protocol) => {
                // FIX: Explicitly cast protocol to number
                const pickler = new Pickler({ protocol: protocol as number });
                const parser = new Parser({ unpicklingTypeOfDictionary: 'Map' });

                const obj = new Map<string, unknown>();
                obj.set('a', 1);
                obj.set('self', obj);

                const pickledData = pickler.dump(obj);
                const unpickledData = parser.parse<Map<string, unknown>>(pickledData);

                expect(unpickledData.get('a')).toBe(1);
                expect(unpickledData.get('self')).toBe(unpickledData);
            },
        );

        it.each(PROTOCOLS_WITH_CYCLE_SUPPORT.map((p) => [p]))(
            'correctly pickles a shared empty container (protocol %p)',
            (protocol) => {
                const pickler = new Pickler({ protocol });
                const parser = new Parser();

                const sharedEmptyList: unknown[] = [];
                const data = {
                    a: sharedEmptyList,
                    b: sharedEmptyList,
                };

                const pickledData = pickler.dump(data);
                const unpickledData = parser.parse<{ a: unknown[]; b: unknown[] }>(pickledData);

                // 1. Check the structure
                expect(unpickledData.a).toEqual([]);
                expect(unpickledData.b).toEqual([]);

                // 2. Check that 'a' and 'b' point to the *exact same* object in memory
                expect(unpickledData.a).toBe(unpickledData.b);
            },
        );
    });

    describe('Protocol Handling', () => {
        // This section is fine
        it('writes protocol header for protocol >= 2', () => {
            const pickler = new Pickler({ protocol: 4 });
            const data = pickler.dump(null);
            expect(data[0]).toBe(OP.PROTO);
            expect(data[1]).toBe(4);
            expect(data[2]).toBe(OP.NONE);
            expect(data[3]).toBe(OP.STOP);
        });

        it('does not write protocol header for protocol < 2', () => {
            const pickler = new Pickler({ protocol: 1 });
            const data = pickler.dump(null);
            expect(data[0]).toBe(OP.NONE);
            expect(data[1]).toBe(OP.STOP);
        });

        it('throws an error for invalid protocol version', () => {
            expect(() => new Pickler({ protocol: 6 }).dump(null)).toThrow('Invalid protocol version: 6');
        });
    });
});
