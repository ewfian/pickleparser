import fs from 'node:fs/promises';
import path from 'node:path';
import { Parser } from '../';

class Document extends Map {}

async function unpickle(fname: string) {
    const pkl = await fs.readFile(path.join(fname), 'binary');
    const buffer = Buffer.from(pkl, 'binary');
    const parser = new Parser(buffer, {
        unpicklingTypeOfDictionary: 'Map',
        unpicklingTypeOfSet: 'Set',
    });
    parser.registry.register('pathlib', 'WindowsPath', (...args) => args.join('\\'));
    parser.registry.register('pathlib', 'PosixPath', (...args) => args.join('/'));
    parser.registry.register('langchain.schema', 'Document', Document);
    return parser.load();
}

const obj = await unpickle('wiki.pkl');
console.log(obj);
// const codePoints = Array.from(obj)
//     .map((v) => v.codePointAt(0).toString(16))
//     .map((hex) => '\\u' + hex.padStart(4, 0) + '')
//     .join('');
// console.log(codePoints);
