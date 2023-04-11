/* eslint-disable @typescript-eslint/no-explicit-any */
import { OP } from './opcode';
import { Reader } from './reader';

export class Parser {
    private _reader: Reader;

    constructor(buffer: Uint8Array | Int8Array | Uint8ClampedArray) {
        this._reader = new Reader(buffer);
    }

    load() {
        const reader = this._reader;
        let stack: any[] = [];
        const metastack: any[] = [];
        const memo = new Map();
        while (reader.hasNext()) {
            const opcode = reader.byte();
            // console.log(`${(reader.position - 1).toString()} ${opcode}`);
            switch (opcode) {
                case OP.PROTO: {
                    const version = reader.byte();
                    if (version > 4) {
                        throw new Error(`Unsupported protocol version '${version}'.`);
                    }
                    break;
                }
                case OP.FRAME:
                    reader.skip(8);
                    break;
                case OP.SHORT_BINUNICODE:
                    stack.push(reader.string(reader.byte(), 'utf-8'));
                    break;
                case OP.MEMOIZE:
                    memo.set(memo.size, stack[stack.length - 1]);
                    break;
                case OP.STACK_GLOBAL: {
                    const name = stack.pop();
                    const module = stack.pop();
                    const cls = this.resolveClass(name, module);
                    if (cls === undefined) {
                        throw new Error(`Cannot emulate global: ${module} ${name}`);
                    }
                    stack.push(cls);
                    break;
                }
                case OP.EMPTY_TUPLE:
                    stack.push([]);
                    break;
                case OP.NEWOBJ: {
                    const args = stack.pop();
                    const cls = stack.pop();
                    const obj = this.newObject(cls, args);
                    stack.push(obj);
                    break;
                }
                case OP.EMPTY_DICT:
                    stack.push({});
                    break;
                case OP.MARK:
                    metastack.push(stack);
                    stack = [];
                    break;
                case OP.BINUNICODE:
                    stack.push(reader.string(reader.uint32(), 'utf-8'));
                    break;
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
                case OP.BININT1:
                    stack.push(reader.byte());
                    break;
                case OP.BININT2:
                    stack.push(reader.uint16());
                    break;
                case OP.EMPTY_SET:
                    stack.push([]);
                    break;
                case OP.BINGET:
                    stack.push(memo.get(reader.byte()));
                    break;
                case OP.ADDITEMS: {
                    const items = stack;
                    stack = metastack.pop();
                    const obj = stack[stack.length - 1];
                    for (let i = 0; i < items.length; i++) {
                        obj.push(items[i]);
                    }
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
                case OP.LONG_BINGET:
                    stack.push(memo.get(reader.uint32()));
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
                case OP.STOP:
                    return stack.pop();
                default:
                    // console.log('metastack:', metastack, '\nstack:', stack);
                    // console.log('\nmemo:', Array.from(memo.entries()));
                    throw new Error(`Unknown opcode '${opcode}'.`);
            }
        }
        throw new Error('Unexpected end of file.');
    }

    resolveClass(name: string, module: string): new (...args: any[]) => any {
        const cls = `${module}.${name}`;
        console.log('*******resolveClass: ', cls);
        return Dummy;
    }

    newObject(cls: new (...args: any[]) => any, ...args: any[]) {
        // console.log('*******newObject: ', cls, args);
        return new cls(args);
    }
}

class Dummy extends Map {
    __dict__(key: string, value: any) {
        this.set(key, value);
    }
}
