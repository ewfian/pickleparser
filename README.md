# Pickle Parser
[![NPM Version](https://img.shields.io/npm/v/pickleparser?logo=npm)](https://www.npmjs.com/package/pickleparser)
[![Unit Test](https://github.com/ewfian/pickleparser/actions/workflows/unit_test.yml/badge.svg)](https://github.com/ewfian/pickleparser/actions/workflows/unit_test.yml)
[![Demo](https://img.shields.io/badge/online-demo-blue.svg)](https://ewfian.github.io/pickleparser/)
[![License](https://img.shields.io/github/license/ewfian/pickleparser)](https://github.com/ewfian/pickleparser)

A pure Javascript implemented parser for [Python pickle format](https://docs.python.org/3.11/library/pickle.html)


## Features

* Fully supports Pickle protocol version 0~5 opcodes.
* Pure Typescript implemented.
* Provides `ParserOptions` to customize Unpickling.
* Supports Browser.
* Supports Node.js.
* Provides tool to convert pickle file to JSON.

## Supported Protocol Version

* Pickle protocol version 0
* Pickle protocol version 1
* [Pickle protocol version 2 (Python 2.3)](https://peps.python.org/pep-0307/)
* Pickle protocol version 3 (Python 3.0)
* [Pickle protocol version 4 (Python 3.4)](https://peps.python.org/pep-3154/)
* [Pickle protocol version 5 (Python 3.8)](https://peps.python.org/pep-0574/)

For more details, see: [Supported Opcodes](./SUPPORTED_OPCODES.md)

## Demo
[Online Pickle to JSON Convertor](https://ewfian.github.io/pickleparser/)

## Installation

```sh
$ npm install pickleparser
```

## Usage

### Node.js
```typescript
import fs from 'node:fs/promises';
import path from 'node:path';
import { Parser } from 'pickleparser';

async function unpickle(fname: string) {
    const pkl = await fs.readFile(path.join(fname), 'binary');
    const buffer = Buffer.from(pkl, 'binary');
    const parser = new Parser();
    return parser.parse(buffer);
}

const obj = await unpickle('pickled.pkl');
console.log(obj);
```


### Browser

```javascript
const fileSelector = document.getElementById('file_selector');
const jsonResultPreviewer = document.getElementById('json_result_previewer');

fileSelector.addEventListener('change', function (e) {
    const file = fileSelector.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const buffer = new Uint8Array(event.target.result);
        const parser = new pickleparser.Parser();
        const obj = parser.parse(buffer);
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