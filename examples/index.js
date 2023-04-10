import fs from 'node:fs/promises';
import path from 'node:path';
import { Parser } from '../';

async function unpickle(fname) {
    const pkl = await fs.readFile(path.join(fname), 'binary');
    const buffer = Buffer.from(pkl, 'binary');
    const parser = new Parser(buffer);
    const obj = parser.load();
    console.log(obj);
}

unpickle('index.pkl');
