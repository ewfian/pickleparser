/* eslint-disable @typescript-eslint/no-explicit-any */
import { OP } from './opcode';
import { IReader, BufferReader, readUint64, readUint64WithBigInt } from './reader';
import { ISetProvider, SetProviderFactory } from './setProvider';
import { IDictionaryProvider, DictionaryProviderFactory } from './dictionaryProvider';
import { createPObject } from './PObject';

export type UnpicklingTypeOfSet = 'array' | 'Set';
export type UnpicklingTypeOfDictionary = 'object' | 'Map';

export interface NameResolver {
    resolve(module: string, name: string): (new (...args: any[]) => any) | ((...args: any[]) => any);
}
export interface PersistentResolver {
    resolve(pid: string): any;
}
export interface ExtensionResolver {
    resolve(extCode: number): any;
}

export interface ParserOptions {
    nameResolver: NameResolver;
    persistentResolver: PersistentResolver;
    extensionResolver: ExtensionResolver;
    unpicklingTypeOfSet: UnpicklingTypeOfSet;
    unpicklingTypeOfDictionary: UnpicklingTypeOfDictionary;
    buffers?: Iterator<any>;
}

const DefualtOptions: ParserOptions = {
    nameResolver: {
        resolve: (module, name) => createPObject(module, name),
    },
    persistentResolver: {
        resolve: (pid) => {
            throw new Error(`Unregistered persistent id: \`${pid}\`.`);
        },
    },
    extensionResolver: {
        resolve: (extCode) => {
            throw new Error(`Unregistered extension code: \`${extCode.toString(16)}\`.`);
        },
    },
    unpicklingTypeOfSet: 'array',
    unpicklingTypeOfDictionary: 'object',
};

export class Parser {
    private readonly _options: ParserOptions;
    private readonly _nameResolver: NameResolver;
    private readonly _persistentResolver: PersistentResolver;
    private readonly _extensionResolver: ExtensionResolver;
    private readonly _setProvider: ISetProvider;
    private readonly _dictionaryProvider: IDictionaryProvider;
    private readonly _buffers?: Iterator<any>;

    constructor(options?: Partial<ParserOptions>) {
        this._options = { ...DefualtOptions, ...options };
        this._nameResolver = this._options.nameResolver;
        this._persistentResolver = this._options.persistentResolver;
        this._extensionResolver = this._options.extensionResolver;
        this._setProvider = SetProviderFactory(this._options.unpicklingTypeOfSet);
        this._dictionaryProvider = DictionaryProviderFactory(this._options.unpicklingTypeOfDictionary);
        this._buffers = options?.buffers;
    }

    parse<T>(buffer: Uint8Array | Int8Array | Uint8ClampedArray): T {
        const reader = new BufferReader(buffer);
        return this.read(reader);
    }

    read<T>(reader: IReader): T {
        let stack: any[] = [];
        const metastack: any[] = [];
        const memo = new Map();
        while (reader.hasNext()) {
            const opcode = reader.byte();
            // console.log(`${((reader as BufferReader).position - 1).toString()} ${opcode}`);
            // console.log('metastack:', metastack, '\nstack:', stack);
            // console.log('\nmemo:', Array.from(memo.entries()));
            switch (opcode) {
                // Structural
                case OP.PROTO: {
                    const version = reader.byte();
                    if (version > 5) {
                        throw new Error(`Unsupported protocol version '${version}'.`);
                    }
                    break;
                }
                case OP.STOP:
                    return stack.pop();
                case OP.FRAME:
                    // Ignore framing, but still have to gobble up the length.
                    reader.skip(8);
                    break;
                case OP.MARK:
                    metastack.push(stack);
                    stack = [];
                    break;
                case OP.POP_MARK:
                    stack = metastack.pop();
                    break;
                case OP.POP:
                    stack.pop();
                    break;
                case OP.DUP:
                    stack.push(stack[stack.length - 1]);
                    break;

                // Memo saving
                case OP.PUT: {
                    const index = parseInt(reader.line(), 10);
                    memo.set(index, stack[stack.length - 1]);
                    break;
                }
                case OP.BINPUT:
                    memo.set(reader.byte(), stack[stack.length - 1]);
                    break;
                case OP.LONG_BINPUT:
                    memo.set(reader.uint32(), stack[stack.length - 1]);
                    break;
                case OP.MEMOIZE:
                    memo.set(memo.size, stack[stack.length - 1]);
                    break;

                // Memo getting
                case OP.GET: {
                    const index = parseInt(reader.line(), 10);
                    stack.push(memo.get(index));
                    break;
                }
                case OP.BINGET:
                    stack.push(memo.get(reader.byte()));
                    break;
                case OP.LONG_BINGET:
                    stack.push(memo.get(reader.uint32()));
                    break;

                // Primitive
                case OP.NONE:
                    stack.push(null);
                    break;
                case OP.NEWTRUE:
                    stack.push(true);
                    break;
                case OP.NEWFALSE:
                    stack.push(false);
                    break;

                // ASCII-formatted numbers
                case OP.INT: {
                    const value = reader.line();
                    if (value == '01') {
                        stack.push(true);
                    } else if (value == '00') {
                        stack.push(false);
                    } else {
                        stack.push(parseInt(value, 10));
                    }
                    break;
                }
                case OP.LONG:
                    stack.push(parseInt(reader.line(), 10));
                    break;
                case OP.FLOAT:
                    stack.push(parseFloat(reader.line()));
                    break;

                // ASCII-formatted strings
                case OP.STRING: {
                    const data = reader.line();
                    // https://github.com/python/cpython/blob/4fe1c4b97e39429abbb9c2117fe40f585de00887/Lib/pickle.py#L1326
                    if (data.length >= 2 && data[0] == data.slice(-1) && ['"', "'"].includes(data[0])) {
                        stack.push(data.slice(1, -1));
                        break;
                    } else {
                        throw new Error('Insecure string pickle.');
                    }
                }
                case OP.UNICODE:
                    stack.push(reader.line());
                    break;

                // Binary-coded numbers
                case OP.BININT:
                    stack.push(reader.int32());
                    break;
                case OP.BININT1:
                    stack.push(reader.byte());
                    break;
                case OP.BININT2:
                    stack.push(reader.uint16());
                    break;
                case OP.LONG1: {
                    const length = reader.byte();
                    const data = reader.bytes(length);
                    const number = readUint64(data);
                    stack.push(number);
                    break;
                }
                case OP.LONG4: {
                    const length = reader.uint32();
                    const data = reader.bytes(length);
                    const number = readUint64WithBigInt(data);
                    stack.push(number);
                    break;
                }
                case OP.BINFLOAT:
                    stack.push(reader.float64());
                    break;

                // Length-prefixed (byte)strings
                case OP.BINBYTES:
                    stack.push(reader.bytes(reader.int32()));
                    break;
                case OP.SHORT_BINBYTES:
                    stack.push(reader.bytes(reader.byte()));
                    break;
                case OP.BINBYTES8:
                    stack.push(reader.bytes(reader.uint64()));
                    break;
                case OP.BINSTRING:
                    stack.push(reader.string(reader.uint32(), 'ascii'));
                    break;
                case OP.SHORT_BINSTRING:
                    stack.push(reader.string(reader.byte(), 'ascii'));
                    break;
                case OP.BINUNICODE:
                    stack.push(reader.string(reader.uint32(), 'utf-8'));
                    break;
                case OP.SHORT_BINUNICODE:
                    stack.push(reader.string(reader.byte(), 'utf-8'));
                    break;
                case OP.BINUNICODE8:
                    stack.push(reader.string(reader.uint64(), 'utf-8'));
                    break;

                // Tuples
                case OP.EMPTY_TUPLE:
                    stack.push([]);
                    break;
                case OP.TUPLE: {
                    const items = stack;
                    stack = metastack.pop();
                    stack.push(items);
                    break;
                }
                case OP.TUPLE1: {
                    stack.push([stack.pop()]);
                    break;
                }
                case OP.TUPLE2: {
                    const b = stack.pop();
                    const a = stack.pop();
                    stack.push([a, b]);
                    break;
                }
                case OP.TUPLE3: {
                    const c = stack.pop();
                    const b = stack.pop();
                    const a = stack.pop();
                    stack.push([a, b, c]);
                    break;
                }

                // Lists
                case OP.EMPTY_LIST:
                    stack.push([]);
                    break;
                case OP.LIST: {
                    const items = stack;
                    stack = metastack.pop();
                    stack.push(items);
                    break;
                }
                case OP.APPEND: {
                    const append = stack.pop();
                    stack[stack.length - 1].push(append);
                    break;
                }
                case OP.APPENDS: {
                    const appends = stack;
                    stack = metastack.pop();
                    const list = stack[stack.length - 1];
                    list.push(...appends);
                    break;
                }

                // Dicts
                case OP.EMPTY_DICT: {
                    const dict = this._dictionaryProvider.create();
                    stack.push(dict);
                    break;
                }
                case OP.DICT: {
                    const items = stack;
                    stack = metastack.pop();
                    const dict = this._dictionaryProvider.create();
                    for (let i = 0; i < items.length; i += 2) {
                        dict[items[i]] = items[i + 1];
                    }
                    stack.push(dict);
                    break;
                }
                case OP.SETITEM: {
                    const value = stack.pop();
                    const key = stack.pop();
                    const dict = stack[stack.length - 1];
                    this._dictionaryProvider.setMethod(dict, key, value);
                    break;
                }
                case OP.SETITEMS: {
                    const items = stack;
                    stack = metastack.pop();
                    const dict = stack[stack.length - 1];
                    // items stored as [k0, v0, ..., kn, vn]
                    for (let pos = 0; pos < items.length; pos += 2) {
                        this._dictionaryProvider.setMethod(dict, items[pos], items[pos + 1]);
                    }
                    break;
                }

                // Sets
                case OP.EMPTY_SET: {
                    const set = this._setProvider.create();
                    stack.push(set);
                    break;
                }
                case OP.FROZENSET: {
                    const items = stack;
                    stack = metastack.pop();
                    const set = this._setProvider.createWithItems(items);
                    stack.push(set);
                    break;
                }
                case OP.ADDITEMS: {
                    const items = stack;
                    stack = metastack.pop();
                    const set = stack[stack.length - 1];
                    for (let i = 0; i < items.length; i++) {
                        this._setProvider.addMethod(set, items[i]);
                    }
                    break;
                }

                // Exts
                case OP.EXT1: {
                    const extCode = reader.byte();
                    const cls = this._extensionResolver.resolve(extCode);
                    stack.push(cls);
                    break;
                }
                case OP.EXT2: {
                    const extCode = reader.uint16();
                    const cls = this._extensionResolver.resolve(extCode);
                    stack.push(cls);
                    break;
                }
                case OP.EXT4: {
                    const extCode = reader.uint32();
                    const cls = this._extensionResolver.resolve(extCode);
                    stack.push(cls);
                    break;
                }

                //  Module globals
                case OP.GLOBAL: {
                    const module = reader.line();
                    const name = reader.line();
                    const cls = this._nameResolver.resolve(module, name);
                    stack.push(cls);
                    break;
                }
                case OP.STACK_GLOBAL: {
                    const name = stack.pop();
                    const module = stack.pop();
                    const cls = this._nameResolver.resolve(module, name);
                    stack.push(cls);
                    break;
                }

                // Classes
                case OP.INST: {
                    const module = reader.line();
                    const name = reader.line();
                    const args = stack;
                    stack = metastack.pop();
                    const cls = this._nameResolver.resolve(module, name);
                    const obj = Reflect.construct(cls, args);
                    stack.push(obj);
                    break;
                }
                case OP.OBJ: {
                    const args = stack;
                    const cls = args.pop();
                    stack = metastack.pop();
                    const obj = Reflect.construct(cls, args);
                    stack.push(obj);
                    break;
                }
                case OP.NEWOBJ: {
                    const args = stack.pop();
                    const cls = stack.pop();
                    const obj = Reflect.construct(cls, args);
                    stack.push(obj);
                    break;
                }
                case OP.NEWOBJ_EX: {
                    const kwargs = stack.pop();
                    const args = stack.pop();
                    const cls = stack.pop();
                    const obj: any = Reflect.construct(cls, args);
                    if (obj.__setnewargs_ex__) {
                        obj.__setnewargs_ex__(kwargs);
                    }
                    stack.push(obj);
                    break;
                }
                case OP.PERSID: {
                    const pid = reader.line();
                    const cls = this._persistentResolver.resolve(pid);
                    stack.push(cls);
                    break;
                }
                case OP.BINPERSID: {
                    const pid = stack.pop();
                    const cls = this._persistentResolver.resolve(pid);
                    stack.push(cls);
                    break;
                }
                case OP.REDUCE: {
                    const args = stack.pop();
                    const func = stack.pop();
                    stack.push(func(...args));
                    break;
                }
                case OP.BUILD: {
                    const state = stack.pop();
                    const obj = stack[stack.length - 1];
                    if (obj.__setstate__) {
                        obj.__setstate__(state);
                        break;
                    }
                    if (obj instanceof Map) {
                        // https://docs.python.org/3/library/stdtypes.html#object.__dict__
                        if (state instanceof Map && state.has('__dict__')) {
                            for (const [key, value] of state.get('__dict__')) {
                                obj.set(key, value);
                            }
                            break;
                        }
                        if (state.__dict__) {
                            for (const key in state.__dict__) {
                                obj.set(key, state.__dict__[key]);
                            }
                            break;
                        }
                    } else {
                        if (state instanceof Map) {
                            Object.assign(obj, Object.fromEntries(state));
                        } else {
                            Object.assign(obj, state);
                        }
                    }
                    break;
                }

                case OP.BYTEARRAY8:
                    stack.push(reader.bytes(reader.uint64()));
                    break;

                case OP.NEXT_BUFFER: {
                    if (this._buffers == null) {
                        throw new Error('pickle stream refers to out-of-band data but no *buffers* argument was given');
                    }
                    const next = this._buffers.next();
                    if (next.done) {
                        throw new Error('not enough out-of-band buffers');
                    }
                    stack.push(next.value);
                    break;
                }

                case OP.READONLY_BUFFER:
                    stack.push(stack.pop());
                    break;

                default:
                    throw new Error(`Unsupported opcode '${opcode}'.`);
            }
        }
        throw new Error('Unexpected end of file.');
    }
}
