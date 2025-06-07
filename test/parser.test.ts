import { OP } from '../src/opcode';
import { Parser, ParserOptions } from '../src/parser';
import { BufferReader } from '../src/reader';

describe('Parser', () => {
    describe('#constructor', () => {
        it('can be constructed', () => {
            const parser = new Parser();
            expect(parser).toBeDefined();
        });

        it('has correct defalut options', () => {
            const parser = new Parser();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: ParserOptions = (parser as any)._options;
            expect(options.unpicklingTypeOfSet).toEqual('array');
            expect(options.unpicklingTypeOfDictionary).toEqual('object');

            const [module, name] = ['myModule', 'myName'];
            const pobj = options.nameResolver.resolve(module, name);
            expect(pobj.prototype).toHaveProperty('__module__', module);
            expect(pobj.prototype).toHaveProperty('__name__', name);
            expect(pobj.name).toEqual('PObject');

            const pid = '5';
            expect(() => options.persistentResolver.resolve(pid)).toThrow(`Unregistered persistent id: \`${pid}\`.`);

            const extCode = 3;
            expect(() => options.extensionResolver.resolve(extCode)).toThrow(
                `Unregistered extension code: \`${extCode.toString(16)}\`.`,
            );
        });

        it('correctly load Resolvers', () => {
            const parser = new Parser({
                nameResolver: {
                    resolve(module, name) {
                        return () => [module, name];
                    },
                },
                extensionResolver: {
                    resolve(extCode) {
                        return extCode;
                    },
                },
                persistentResolver: {
                    resolve(pid) {
                        return pid;
                    },
                },
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: ParserOptions = (parser as any)._options;

            const [module, name] = ['myModule', 'myName'];
            expect((options.nameResolver.resolve(module, name) as () => [string, string])()).toEqual([module, name]);

            const pid = '5';
            expect(options.persistentResolver.resolve(pid)).toEqual(pid);

            const extCode = 3;
            expect(options.extensionResolver.resolve(extCode)).toEqual(extCode);
        });

        it('correctly load options', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser = new Parser({
                unpicklingTypeOfSet: 'Set',
                unpicklingTypeOfDictionary: 'Map',
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: ParserOptions = (parser as any)._options;
            expect(options.unpicklingTypeOfSet).toEqual('Set');
            expect(options.unpicklingTypeOfDictionary).toEqual('Map');
        });
    });

    describe('#read', () => {
        it('correctly read data', () => {
            const parser = new Parser();
            const pkl = new Uint8Array([OP.PROTO, 4, OP.BININT1, 3, OP.STOP]);
            const reader = new BufferReader(pkl);
            expect(parser.read(reader)).toEqual(3);
        });
    });

    describe('#parse', () => {
        it('throws an error if the input buffer is empty', () => {
            const parser = new Parser();
            expect(() => parser.parse(new Uint8Array())).toThrow('Unexpected end of file.');
        });

        it('correctly parse data', () => {
            const parser = new Parser();
            const pkl = new Uint8Array([OP.PROTO, 4, OP.BININT1, 3, OP.STOP]);
            expect(parser.parse(pkl)).toEqual(3);
        });

        it('correctly load buffers', () => {
            const expected = [123, 'str'];
            const parser = new Parser({
                buffers: (function* () {
                    yield expected;
                })(),
            });
            const pkl = new Uint8Array([OP.PROTO, 5, OP.NEXT_BUFFER, OP.STOP]);
            expect(parser.parse(pkl)).toStrictEqual(expected);
        });

        it('throws errors if buffers not provided', () => {
            const parser = new Parser();
            const pkl = new Uint8Array([OP.PROTO, 5, OP.NEXT_BUFFER, OP.STOP]);
            expect(() => parser.parse(pkl)).toThrow(
                'pickle stream refers to out-of-band data but no *buffers* argument was given',
            );
        });

        it('throws errors if not enough buffers', () => {
            const parser = new Parser({
                buffers: (function* () {
                    yield 1;
                })(),
            });
            const pkl = new Uint8Array([OP.PROTO, 5, OP.NEXT_BUFFER, OP.NEXT_BUFFER, OP.STOP]);
            expect(() => parser.parse(pkl)).toThrow('not enough out-of-band buffers');
        });

        it('throws errors w/ unsupported OP code', () => {
            const parser = new Parser();
            const pkl = new Uint8Array([OP.READONLY_BUFFER + 1]);
            expect(() => parser.parse(pkl)).toThrow("Unsupported opcode '153'.");
        });

        it('throws errors w/ unsupported protocol', () => {
            const parser = new Parser();
            const pkl = new Uint8Array([OP.PROTO, 6, OP.STOP]);
            expect(() => parser.parse(pkl)).toThrow("Unsupported protocol version '6'.");
        });

        it('should correctly parse a dictionary into a Map with non-string keys', () => {
            // This simulates a pickle stream for a dictionary: {1: "one", null: "is null"}
            // using protocol 2.
            // The stream is: PROTO 2, MARK, BININT1 1, BINUNICODE "one", NONE, BINUNICODE "is null", DICT, STOP
            const pkl = new Uint8Array([
                OP.PROTO,
                2, // Protocol header
                OP.MARK, // Mark for dictionary items
                OP.BININT1,
                1, // Key: 1 (integer)
                OP.BINUNICODE,
                3,
                0,
                0,
                0,
                0x6f,
                0x6e,
                0x65, // Value: "one"
                OP.NONE, // Key: null
                OP.BINUNICODE,
                7,
                0,
                0,
                0,
                0x69,
                0x73,
                0x20,
                0x6e,
                0x75,
                0x6c,
                0x6c, // Value: "is null"
                OP.DICT, // Build dictionary from items
                OP.STOP, // Stop
            ]);

            // Configure the parser to produce Maps
            const parser = new Parser({
                unpicklingTypeOfDictionary: 'Map',
            });

            const result = parser.parse<Map<unknown, unknown>>(pkl);

            const expected = new Map<unknown, unknown>();
            expected.set(1, 'one');
            expected.set(null, 'is null');

            expect(result).toStrictEqual(expected);
        });
    });
});
