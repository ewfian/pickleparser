import fs from 'node:fs/promises';
import path from 'node:path';
import { Parser } from '../';

class WindowsPath {
    constructor(...args) {
        this.path = args.join('\\');
    }
}

class PosixPath {
    constructor(...args) {
        this.path = args.join('/');
    }
}

async function unpickle(fname) {
    const pkl = await fs.readFile(path.join(fname), 'binary');
    const buffer = Buffer.from(pkl, 'binary');
    const parser = new Parser(buffer);
    parser.registry.register('pathlib', 'WindowsPath', WindowsPath);
    parser.registry.register('pathlib', 'PosixPath', PosixPath);
    const obj = parser.load();
    console.log(obj);
    // =>
    // PObject {
    //   data: 'test',
    //   set: [ false, 1, 2, 3, null, 'abc', 4294967295, 9007199254740991 ],
    //   fruits: [ 'apple', 'banana', 'cherry', 'orange' ]
    // }
}

unpickle('long4.pkl');
