# Pickle Parser
[![NPM Version](https://img.shields.io/npm/v/pickleparser?logo=npm)](https://www.npmjs.com/package/pickleparser)
[![License](https://img.shields.io/github/license/ewfian/pickleparser)](https://github.com/ewfian/pickleparser)

A pure Typescript implemented parser for [Python pickle format](https://docs.python.org/3.11/library/pickle.html)


## Features

* Pure Typescript implemented.
* Most of [Pickle protocol version 4](https://peps.python.org/pep-3154/) opcodes supported.
* Supports Browser.
* Supports Node.js.
* Provides tool to convert pickle file to JSON.

## Supported Opcodes
See: [Supported Opcodes](./SUPPORTED_OPCODES.md)

## Installation

```sh
$ npm install pickleparser
```

## Usage

### Node.js
```ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { Parser } from '../';

async function unpickle(fname) {
    const pkl = await fs.readFile(path.join(fname), 'binary');
    const buffer = Buffer.from(pkl, 'binary');
    const parser = new Parser(buffer);
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
```


### Browser

```js
const fileSelector = document.getElementById('file_selector');
const jsonResultPreviewer = document.getElementById('json_result_previewer');

fileSelector.addEventListener('change', function (e) {
    const file = fileSelector.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const buffer = new Uint8Array(event.target.result);
        const parser = new pickleparser.Parser(buffer);
        const obj = parser.load();
        const json = JSON.stringify(obj, null, 4);
        jsonResultPreviewer.innerText = json;
    }

    reader.readAsArrayBuffer(file);
});
```

### Terminal

```bash
npx pickleparser file.pkl file.json
# or
npm i pickleparser -g
pickletojson file.pkl file.json
```


## License

MIT