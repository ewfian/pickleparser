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
    const codePoints = Array.from(obj)
        .map((v) => v.codePointAt(0).toString(16))
        .map((hex) => '\\u' + hex.padStart(4, 0) + '')
        .join('');
    console.log(codePoints);
}

unpickle('u8.pkl');
