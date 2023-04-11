import fs from 'node:fs/promises';
import path from 'node:path';
import { Parser } from '../';

class MyClass {}

async function unpickle(fname) {
    const pkl = await fs.readFile(path.join(fname), 'binary');
    const buffer = Buffer.from(pkl, 'binary');
    const parser = new Parser(buffer);
    parser.registry.register('__main__', 'MyClass', MyClass);
    const obj = parser.load();
    console.log(obj);
// => 
// MyClass {
//   data: 'test',
//   set: [ false, 1, 2, 3, 'abc', null, 4294967295, 9007199254740991 ],
//   fruits: [ 'apple', 'banana', 'cherry', 'orange' ]
// }
}

unpickle('index.pkl');
