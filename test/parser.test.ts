import { OP } from '../src/opcode';
import { Parser, ParserOptions } from '../src/parser';
import { BufferReader } from '../src/reader';

const asciiLine = (text: string) => Array.from(Buffer.from(`${text}\n`, 'ascii'));
const asciiBytes = (text: string) => Array.from(Buffer.from(text, 'ascii'));
const utf8Bytes = (text: string) => Array.from(Buffer.from(text, 'utf-8'));
const int32LE = (value: number) => {
    const buffer = Buffer.alloc(4);
    buffer.writeInt32LE(value, 0);
    return Array.from(buffer);
};
const uint16LE = (value: number) => {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16LE(value, 0);
    return Array.from(buffer);
};
const uint32LE = (value: number) => {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(value, 0);
    return Array.from(buffer);
};
const uint64LE = (value: number | bigint) => {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(value), 0);
    return Array.from(buffer);
};
const float64BE = (value: number) => {
    const buffer = Buffer.alloc(8);
    buffer.writeDoubleBE(value, 0);
    return Array.from(buffer);
};
const withProto = (body: number[]) => new Uint8Array([OP.PROTO, 5, ...body, OP.STOP]);

class Accumulator {
    public args: unknown[];
    public stateHistory: unknown[] = [];
    public newArgs?: unknown;

    constructor(...args: unknown[]) {
        this.args = args;
    }

    __setstate__(state: unknown) {
        this.stateHistory.push(state);
    }

    __setnewargs_ex__(kwargs: unknown) {
        this.newArgs = kwargs;
    }
}

class Plain {
    public args: unknown[];

    constructor(...args: unknown[]) {
        this.args = args;
    }
}

class StackSample {}

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
    });

    describe('#parse advanced opcodes', () => {
        it('handles numeric and binary opcodes end-to-end', () => {
            const binString = asciiBytes('ascii-binstring');
            const shortBinString = asciiBytes('hey');
            const unicodeText = utf8Bytes('wide-unicode');
            const shortUnicodeText = utf8Bytes('short-unicode');
            const unicode8Text = utf8Bytes('unicode8');
            const bytes = withProto([
                OP.FRAME,
                ...uint64LE(0),
                OP.EMPTY_LIST,
                OP.MARK,
                OP.NONE,
                OP.NEWTRUE,
                OP.NEWFALSE,
                OP.INT,
                ...asciiLine('01'),
                OP.INT,
                ...asciiLine('00'),
                OP.INT,
                ...asciiLine('123'),
                OP.LONG,
                ...asciiLine('999999999999'),
                OP.FLOAT,
                ...asciiLine('3.75'),
                OP.BININT,
                ...int32LE(0x12345678),
                OP.BININT1,
                200,
                OP.BININT2,
                ...uint16LE(1027),
                OP.LONG1,
                2,
                0x34,
                0x12,
                OP.LONG4,
                ...uint32LE(4),
                0x78,
                0x56,
                0x34,
                0x12,
                OP.BINFLOAT,
                ...float64BE(6.25),
                OP.BINBYTES,
                ...int32LE(4),
                1,
                2,
                3,
                4,
                OP.SHORT_BINBYTES,
                3,
                5,
                6,
                7,
                OP.BINBYTES8,
                ...uint64LE(2),
                8,
                9,
                OP.BINSTRING,
                ...uint32LE(binString.length),
                ...binString,
                OP.SHORT_BINSTRING,
                shortBinString.length,
                ...shortBinString,
                OP.BINUNICODE,
                ...uint32LE(unicodeText.length),
                ...unicodeText,
                OP.SHORT_BINUNICODE,
                shortUnicodeText.length,
                ...shortUnicodeText,
                OP.BINUNICODE8,
                ...uint64LE(unicode8Text.length),
                ...unicode8Text,
                OP.UNICODE,
                ...asciiLine('plain-unicode'),
                OP.STRING,
                ...asciiLine('"safe-string"'),
                OP.BYTEARRAY8,
                ...uint64LE(3),
                9,
                10,
                11,
                OP.APPENDS,
            ]);
            const parser = new Parser();
            const result = parser.parse<unknown[]>(bytes);
            expect(result).toEqual([
                null,
                true,
                false,
                true,
                false,
                123,
                999999999999,
                3.75,
                0x12345678,
                200,
                1027,
                0x1234,
                BigInt(0x12345678),
                6.25,
                new Uint8Array([1, 2, 3, 4]),
                new Uint8Array([5, 6, 7]),
                new Uint8Array([8, 9]),
                'ascii-binstring',
                'hey',
                'wide-unicode',
                'short-unicode',
                'unicode8',
                'plain-unicode',
                'safe-string',
                new Uint8Array([9, 10, 11]),
            ]);
        });

        it('handles container, memo, and set/dict opcodes', () => {
            const bytes = withProto([
                OP.EMPTY_LIST,
                OP.BININT1,
                7,
                OP.DUP,
                OP.POP,
                OP.APPEND,
                OP.MARK,
                OP.BININT1,
                9,
                OP.POP_MARK,
                OP.BININT1,
                9,
                OP.APPEND,
                OP.BININT1,
                42,
                OP.PUT,
                ...asciiLine('2'),
                OP.POP,
                OP.GET,
                ...asciiLine('2'),
                OP.APPEND,
                OP.BININT1,
                77,
                OP.BINPUT,
                5,
                OP.POP,
                OP.BINGET,
                5,
                OP.APPEND,
                OP.BININT1,
                88,
                OP.LONG_BINPUT,
                ...uint32LE(300),
                OP.POP,
                OP.LONG_BINGET,
                ...uint32LE(300),
                OP.APPEND,
                OP.BININT1,
                99,
                OP.MEMOIZE,
                OP.POP,
                OP.LONG_BINGET,
                ...uint32LE(3),
                OP.APPEND,
                OP.EMPTY_TUPLE,
                OP.APPEND,
                OP.MARK,
                OP.BININT1,
                1,
                OP.BININT1,
                2,
                OP.TUPLE,
                OP.APPEND,
                OP.BININT1,
                11,
                OP.TUPLE1,
                OP.APPEND,
                OP.BININT1,
                12,
                OP.BININT1,
                13,
                OP.TUPLE2,
                OP.APPEND,
                OP.BININT1,
                14,
                OP.BININT1,
                15,
                OP.BININT1,
                16,
                OP.TUPLE3,
                OP.APPEND,
                OP.MARK,
                OP.BININT1,
                21,
                OP.BININT1,
                22,
                OP.LIST,
                OP.APPEND,
                OP.EMPTY_LIST,
                OP.MARK,
                OP.BININT1,
                30,
                OP.BININT1,
                31,
                OP.APPENDS,
                OP.APPEND,
                OP.MARK,
                OP.UNICODE,
                ...asciiLine('k1'),
                OP.BININT1,
                1,
                OP.UNICODE,
                ...asciiLine('k2'),
                OP.BININT1,
                2,
                OP.DICT,
                OP.APPEND,
                OP.EMPTY_DICT,
                OP.UNICODE,
                ...asciiLine('direct'),
                OP.BININT1,
                5,
                OP.SETITEM,
                OP.MARK,
                OP.UNICODE,
                ...asciiLine('batchA'),
                OP.BININT1,
                6,
                OP.UNICODE,
                ...asciiLine('batchB'),
                OP.BININT1,
                7,
                OP.SETITEMS,
                OP.APPEND,
                OP.EMPTY_SET,
                OP.MARK,
                OP.BININT1,
                1,
                OP.BININT1,
                2,
                OP.ADDITEMS,
                OP.APPEND,
                OP.MARK,
                OP.BININT1,
                5,
                OP.BININT1,
                6,
                OP.FROZENSET,
                OP.APPEND,
                OP.BINBYTES,
                ...int32LE(2),
                100,
                101,
                OP.READONLY_BUFFER,
                OP.APPEND,
            ]);
            const parser = new Parser();
            const result = parser.parse<unknown[]>(bytes);
            expect(result).toEqual([
                7,
                9,
                42,
                77,
                88,
                99,
                [],
                [1, 2],
                [11],
                [12, 13],
                [14, 15, 16],
                [21, 22],
                [30, 31],
                { k1: 1, k2: 2 },
                { direct: 5, batchA: 6, batchB: 7 },
                [1, 2],
                [5, 6],
                new Uint8Array([100, 101]),
            ]);
        });

        it('handles globals, extensions, and object constructors', () => {
            const registry: Record<string, any> = {
                'mod:Accumulator': Accumulator,
                'mod:Plain': Plain,
                'mod:StackSample': StackSample,
                'fn:builder': (...args: number[]) => args.reduce((sum, value) => sum + value, 0),
            };
            const parser = new Parser({
                nameResolver: {
                    resolve(module, name) {
                        const key = `${module}:${name}`;
                        const resolved = registry[key];
                        if (!resolved) {
                            throw new Error(`Missing resolver for ${key}`);
                        }
                        return resolved;
                    },
                },
                extensionResolver: {
                    resolve(code) {
                        return `ext-${code}`;
                    },
                },
                persistentResolver: {
                    resolve(pid) {
                        return `pid:${pid}`;
                    },
                },
            });
            const bytes = withProto([
                OP.EMPTY_LIST,
                OP.GLOBAL,
                ...asciiLine('mod'),
                ...asciiLine('Accumulator'),
                OP.APPEND,
                OP.UNICODE,
                ...asciiLine('mod'),
                OP.UNICODE,
                ...asciiLine('StackSample'),
                OP.STACK_GLOBAL,
                OP.APPEND,
                OP.EXT1,
                7,
                OP.APPEND,
                OP.EXT2,
                ...uint16LE(513),
                OP.APPEND,
                OP.EXT4,
                ...uint32LE(70000),
                OP.APPEND,
                OP.PERSID,
                ...asciiLine('pid-1'),
                OP.APPEND,
                OP.UNICODE,
                ...asciiLine('pid-2'),
                OP.BINPERSID,
                OP.APPEND,
                OP.GLOBAL,
                ...asciiLine('fn'),
                ...asciiLine('builder'),
                OP.MARK,
                OP.BININT1,
                3,
                OP.BININT1,
                4,
                OP.TUPLE,
                OP.REDUCE,
                OP.APPEND,
                OP.MARK,
                OP.BININT1,
                1,
                OP.BININT1,
                2,
                OP.INST,
                ...asciiLine('mod'),
                ...asciiLine('Accumulator'),
                OP.EMPTY_DICT,
                OP.UNICODE,
                ...asciiLine('state'),
                OP.BININT1,
                9,
                OP.SETITEM,
                OP.BUILD,
                OP.APPEND,
                OP.MARK,
                OP.BININT1,
                5,
                OP.BININT1,
                6,
                OP.GLOBAL,
                ...asciiLine('mod'),
                ...asciiLine('Plain'),
                OP.OBJ,
                OP.APPEND,
                OP.GLOBAL,
                ...asciiLine('mod'),
                ...asciiLine('Plain'),
                OP.MARK,
                OP.BININT1,
                7,
                OP.BININT1,
                8,
                OP.TUPLE,
                OP.NEWOBJ,
                OP.APPEND,
                OP.GLOBAL,
                ...asciiLine('mod'),
                ...asciiLine('Accumulator'),
                OP.BININT1,
                3,
                OP.TUPLE1,
                OP.EMPTY_DICT,
                OP.UNICODE,
                ...asciiLine('kw'),
                OP.BININT1,
                1,
                OP.SETITEM,
                OP.NEWOBJ_EX,
                OP.APPEND,
            ]);
            const result = parser.parse<unknown[]>(bytes);
            expect(result[0]).toBe(Accumulator);
            expect(result[1]).toBe(StackSample);
            expect(result.slice(2, 5)).toEqual(['ext-7', 'ext-513', 'ext-70000']);
            expect(result[5]).toBe('pid:pid-1');
            expect(result[6]).toBe('pid:pid-2');
            expect(result[7]).toBe(7);
            const instWithState = result[8] as Accumulator;
            expect(instWithState).toBeInstanceOf(Accumulator);
            expect(instWithState.args).toEqual([1, 2]);
            expect(instWithState.stateHistory).toEqual([{ state: 9 }]);
            const objInstance = result[9] as Plain;
            expect(objInstance).toBeInstanceOf(Plain);
            expect(objInstance.args).toEqual([5, 6]);
            const newObjInstance = result[10] as Plain;
            expect(newObjInstance).toBeInstanceOf(Plain);
            expect(newObjInstance.args).toEqual([7, 8]);
            const newObjExInstance = result[11] as Accumulator;
            expect(newObjExInstance).toBeInstanceOf(Accumulator);
            expect(newObjExInstance.args).toEqual([3]);
            expect(newObjExInstance.newArgs).toEqual({ kw: 1 });
        });

        it('handles BUILD branches for maps and plain objects', () => {
            const parser = new Parser({
                nameResolver: {
                    resolve(module, name) {
                        if (`${module}:${name}` === 'mod:Plain') {
                            return Plain;
                        }
                        throw new Error(`Missing resolver for ${module}:${name}`);
                    },
                },
                persistentResolver: {
                    resolve(pid) {
                        switch (pid) {
                            case 'map-target':
                                return new Map<string, unknown>();
                            case 'map-state-map':
                                return new Map([['__dict__', new Map([['alpha', 1]])]]);
                            case 'map-state-plain':
                                return { __dict__: { beta: 2 } };
                            case 'map-state-values':
                                return new Map([['gamma', 3]]);
                            case 'plain-state':
                                return { delta: 4 };
                            default:
                                throw new Error(`Unknown pid ${pid}`);
                        }
                    },
                },
            });
            const bytes = withProto([
                OP.EMPTY_LIST,
                OP.PERSID,
                ...asciiLine('map-target'),
                OP.PERSID,
                ...asciiLine('map-state-map'),
                OP.BUILD,
                OP.APPEND,
                OP.PERSID,
                ...asciiLine('map-target'),
                OP.PERSID,
                ...asciiLine('map-state-plain'),
                OP.BUILD,
                OP.APPEND,
                OP.GLOBAL,
                ...asciiLine('mod'),
                ...asciiLine('Plain'),
                OP.EMPTY_TUPLE,
                OP.NEWOBJ,
                OP.PERSID,
                ...asciiLine('map-state-values'),
                OP.BUILD,
                OP.APPEND,
                OP.GLOBAL,
                ...asciiLine('mod'),
                ...asciiLine('Plain'),
                OP.EMPTY_TUPLE,
                OP.NEWOBJ,
                OP.PERSID,
                ...asciiLine('plain-state'),
                OP.BUILD,
                OP.APPEND,
            ]);
            const result = parser.parse<unknown[]>(bytes);
            const mapFromMapState = result[0] as Map<string, number>;
            expect(mapFromMapState).toBeInstanceOf(Map);
            expect(Array.from(mapFromMapState.entries())).toEqual([['alpha', 1]]);
            const mapFromPlainState = result[1] as Map<string, number>;
            expect(Array.from(mapFromPlainState.entries())).toEqual([['beta', 2]]);
            const objFromMapState = result[2] as Plain & { gamma?: number };
            expect(objFromMapState).toBeInstanceOf(Plain);
            expect(objFromMapState.gamma).toBe(3);
            const objFromPlainState = result[3] as Plain & { delta?: number };
            expect(objFromPlainState).toBeInstanceOf(Plain);
            expect(objFromPlainState.delta).toBe(4);
        });

        it('throws when STRING opcode payload is insecure', () => {
            const parser = new Parser();
            const bytes = withProto([OP.STRING, ...asciiLine('unsafe')]);
            expect(() => parser.parse(bytes)).toThrow('Insecure string pickle.');
        });
    });
});
