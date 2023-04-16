/* eslint-disable @typescript-eslint/no-explicit-any */
import { OP } from './opcode';
import { Reader } from './reader';
import { Registry } from './registry';

export interface ParserOptions {
    onPersistentLoad: (pid: string) => any;
    onExtensionLoad: (extCode: number) => any;
}

const DefualtParserOptions: ParserOptions = {
    onPersistentLoad(pid) {
        throw new Error(`Unregistered persistent id: \`${pid}\`.`);
    },
    onExtensionLoad(extCode) {
        throw new Error(`Unregistered extension code: \`${extCode.toString(16)}\`.`);
    },
};

export class Parser {
    private _reader: Reader;

    options: ParserOptions;
    registry: Registry = new Registry();

    constructor(buffer: Uint8Array | Int8Array | Uint8ClampedArray, options: ParserOptions = DefualtParserOptions) {
        this._reader = new Reader(buffer);
        this.options = options;
    }

    load() {
        const reader = this._reader;
        let stack: any[] = [];
        const metastack: any[] = [];
        const memo = new Map();
        while (reader.hasNext()) {
            const opcode = reader.byte();
            // console.log(`${(reader.position - 1).toString()} ${opcode}`);
            // console.log('metastack:', metastack, '\nstack:', stack);
            // console.log('\nmemo:', Array.from(memo.entries()));
            switch (opcode) {
                // Structural
                case OP.PROTO: {
                    const version = reader.byte();
                    if (version > 4) {
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

                // Literal
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
                    const str = reader.line();
                    stack.push(str.substr(1, str.length - 2));
                    break;
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
                    const number = this.readUint64(data);
                    stack.push(number);
                    break;
                }
                // case OP.LONG4:
                //     break;
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
                case OP.EMPTY_DICT:
                    stack.push({});
                    break;
                case OP.DICT: {
                    const items = stack;
                    stack = metastack.pop();
                    const dict: any = {};
                    for (let i = 0; i < items.length; i += 2) {
                        dict[items[i]] = items[i + 1];
                    }
                    stack.push(dict);
                    break;
                }
                case OP.SETITEM: {
                    const value = stack.pop();
                    const key = stack.pop();
                    const obj = stack[stack.length - 1];
                    if (obj.__setitem__) {
                        obj.__setitem__(key, value);
                    } else {
                        obj[key] = value;
                    }
                    break;
                }
                case OP.SETITEMS: {
                    const items = stack;
                    stack = metastack.pop();
                    const obj = stack[stack.length - 1];
                    // items stored as [k0, v0, ..., kn, vn]
                    for (let pos = 0; pos < items.length; pos += 2) {
                        if (obj.__setitem__) {
                            obj.__setitem__(items[pos], items[pos + 1]);
                        } else {
                            obj[items[pos]] = items[pos + 1];
                        }
                    }
                    break;
                }

                // Sets
                case OP.EMPTY_SET:
                    stack.push([]);
                    break;
                case OP.FROZENSET: {
                    const items = stack;
                    stack = metastack.pop();
                    stack.push(items);
                    break;
                }
                case OP.ADDITEMS: {
                    const items = stack;
                    stack = metastack.pop();
                    const obj = stack[stack.length - 1];
                    for (let i = 0; i < items.length; i++) {
                        obj.push(items[i]);
                    }
                    break;
                }

                // Exts
                case OP.EXT1: {
                    const extCode = reader.byte();
                    const cls = this.options.onExtensionLoad(extCode);
                    stack.push(cls);
                    break;
                }
                case OP.EXT2: {
                    const extCode = reader.uint16();
                    const cls = this.options.onExtensionLoad(extCode);
                    stack.push(cls);
                    break;
                }
                case OP.EXT4: {
                    const extCode = reader.uint32();
                    const cls = this.options.onExtensionLoad(extCode);
                    stack.push(cls);
                    break;
                }

                //  Module globals
                case OP.GLOBAL: {
                    const module = reader.line();
                    const name = reader.line();
                    const cls = this.resolveClass(module, name);
                    stack.push(cls);
                    break;
                }
                case OP.STACK_GLOBAL: {
                    const name = stack.pop();
                    const module = stack.pop();
                    const cls = this.resolveClass(module, name);
                    stack.push(cls);
                    break;
                }

                // Classes
                case OP.INST: {
                    const module = reader.line();
                    const name = reader.line();
                    const args = stack;
                    stack = metastack.pop();
                    const cls = this.resolveClass(module, name);
                    const obj = this.newObject(cls, ...args);
                    stack.push(obj);
                    break;
                }
                case OP.OBJ: {
                    const args = stack;
                    const cls = args.pop();
                    stack = metastack.pop();
                    const obj = this.newObject(cls, ...args);
                    stack.push(obj);
                    break;
                }
                case OP.NEWOBJ: {
                    const args = stack.pop();
                    const cls = stack.pop();
                    const obj = this.newObject(cls, ...args);
                    stack.push(obj);
                    break;
                }
                case OP.NEWOBJ_EX: {
                    const kwargs = stack.pop();
                    const args = stack.pop();
                    const cls = stack.pop();
                    const obj = this.newObject(cls, ...args);
                    if (obj.__setnewargs_ex__) {
                        obj.__setnewargs_ex__(kwargs);
                    }
                    stack.push(obj);
                    break;
                }
                case OP.PERSID: {
                    const pid = reader.line();
                    const cls = this.options.onPersistentLoad(pid);
                    stack.push(cls);
                    break;
                }
                case OP.BINPERSID: {
                    const pid = stack.pop();
                    const cls = this.options.onPersistentLoad(pid);
                    stack.push(cls);
                    break;
                }
                case OP.REDUCE: {
                    const args = stack.pop();
                    const func = stack.pop();
                    stack.push(this.newObject(func, ...args));
                    break;
                }
                case OP.BUILD: {
                    const state = stack.pop();
                    const obj = stack[stack.length - 1];
                    if (obj.__setstate__) {
                        obj.__setstate__(state);
                    } else if (obj.__dict__) {
                        // https://docs.python.org/3/library/stdtypes.html#object.__dict__
                        for (const key in state) {
                            if (key !== '__dict__') {
                                obj[key] = state[key];
                            }
                        }
                        for (const key in state.__dict__) {
                            obj.__dict__(key, state.__dict__[key]);
                        }
                    } else {
                        Object.assign(obj, state);
                    }
                    break;
                }

                default:
                    throw new Error(`Unsupported opcode '${opcode}'.`);
            }
        }
        throw new Error('Unexpected end of file.');
    }

    readUint64(data: Uint8Array | Int8Array | Uint8ClampedArray) {
        if (data.length > 8) {
            throw new Error('Value too large to unpickling');
        }
        // Padding to 8 bytes
        const buffer = new ArrayBuffer(8);
        const uint8 = new Uint8Array(buffer);
        uint8.set(data);
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView#64-bit_integer_values
        const view = new DataView(buffer, 0, 8);
        // split 64-bit number into two 32-bit parts
        const left = view.getUint32(0, true);
        const right = view.getUint32(4, true);
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

    resolveClass(module: string, name: string): new (...args: any[]) => any {
        return this.registry.resolve(module, name);
    }

    newObject(cls: new (...args: any[]) => any, ...args: any[]) {
        return new cls(...args);
    }
}
