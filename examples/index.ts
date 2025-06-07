import fs from 'node:fs/promises';
import path from 'node:path';
import { Parser, NameRegistry, Pickler } from '../src';

class Document extends Map {}

async function unpickle(fname: string) {
    const pkl = await fs.readFile(path.join(fname), 'binary');
    const buffer = Buffer.from(pkl, 'binary');

    const registry = new NameRegistry()
        .register('pathlib', 'WindowsPath', (...args) => args.join('\\'))
        .register('pathlib', 'PosixPath', (...args) => args.join('/'))
        .register('langchain.schema', 'Document', Document);

    const parser = new Parser({
        nameResolver: registry,
        unpicklingTypeOfDictionary: 'Map',
        unpicklingTypeOfSet: 'Set',
    });
    return parser.parse(buffer);
}

async function pickle(obj: unknown, fname: string) {
    const pickler = new Pickler({
        protocol: 2,
    });
    const buffer = pickler.dump(obj);
    await fs.writeFile(fname, buffer);
}

const obj = await unpickle('wiki.pkl');
console.log(obj);
await pickle(obj, 'wiki-processed.pkl');
// const codePoints = Array.from(obj)
//     .map((v) => v.codePointAt(0).toString(16))
//     .map((hex) => '\\u' + hex.padStart(4, 0) + '')
//     .join('');
// console.log(codePoints);
