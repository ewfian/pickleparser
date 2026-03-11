# Pickle Parser
[![NPM Version](https://img.shields.io/npm/v/pickleparser?logo=npm)](https://www.npmjs.com/package/pickleparser)
[![Unit Test](https://github.com/ewfian/pickleparser/actions/workflows/unit_test.yml/badge.svg)](https://github.com/ewfian/pickleparser/actions/workflows/unit_test.yml)
[![Demo](https://img.shields.io/badge/online-demo-blue.svg)](https://ewfian.github.io/pickleparser/)
[![License](https://img.shields.io/github/license/ewfian/pickleparser)](https://github.com/ewfian/pickleparser)

A pure TypeScript parser for the [Python pickle format](https://docs.python.org/3/library/pickle.html). Supports protocol 0 through 5.

## Features

* Pickle protocol version 0~5, all opcodes supported
* Pure TypeScript, zero dependencies
* Works in Node.js and browsers
* Customizable via `ParserOptions` (name resolution, dict/set types, out-of-band buffers)
* CLI tool to convert pickle files to JSON

## Demo
[Online Pickle to JSON Converter](https://ewfian.github.io/pickleparser/)

## Installation

```sh
npm install pickleparser
```

## Usage

### Node.js

```typescript
import fs from 'node:fs/promises';
import { Parser } from 'pickleparser';

const buffer = await fs.readFile('data.pkl');
const obj = new Parser().parse(buffer);
console.log(obj);
```

### Browser

```html
<script src="https://unpkg.com/pickleparser/dist/index.js"></script>
<script>
const buffer = new Uint8Array(arrayBuffer);
const obj = new pickleparser.Parser().parse(buffer);
</script>
```

### CLI

```bash
npx pickleparser file.pkl file.json
# or
npm i pickleparser -g
pickletojson file.pkl file.json
```

## API

### `new Parser(options?)`

```typescript
import { Parser } from 'pickleparser';

const parser = new Parser({
    unpicklingTypeOfDictionary: 'Map',
    unpicklingTypeOfSet: 'Set',
});
const result = parser.parse<MyType>(buffer);
```

### ParserOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `unpicklingTypeOfDictionary` | `'object' \| 'Map'` | `'object'` | Python `dict` maps to JS plain object or `Map` |
| `unpicklingTypeOfSet` | `'array' \| 'Set'` | `'array'` | Python `set` maps to JS array or `Set` |
| `nameResolver` | `NameResolver` | built-in | Resolve Python classes/functions by module and name |
| `persistentResolver` | `PersistentResolver` | throws | Resolve persistent object references |
| `extensionResolver` | `ExtensionResolver` | throws | Resolve extension registry codes |
| `buffers` | `Iterator<any>` | `undefined` | Out-of-band buffers for protocol 5 |

### NameResolver

Register custom constructors to control how Python classes are instantiated:

```typescript
import { Parser, NameRegistry } from 'pickleparser';

class MyClass {
    x: number = 0;
    y: number = 0;
}

const registry = new NameRegistry()
    .register('mymodule', 'MyClass', MyClass);

const obj = new Parser({ nameResolver: registry }).parse<MyClass>(buffer);
```

## Type Mapping

| Python | JavaScript | Notes |
|--------|-----------|-------|
| `dict` | `{}` or `Map` | controlled by `unpicklingTypeOfDictionary` |
| `list` | `Array` | |
| `tuple` | `Array` | |
| `set`, `frozenset` | `Array` or `Set` | controlled by `unpicklingTypeOfSet` |
| `str` | `string` | |
| `bytes`, `bytearray` | `Buffer` (Node.js) | |
| `int` | `number` | |
| `int` (> 2^53) | `number` with precision loss, or `BigInt` via LONG4 | |
| `float` | `number` | including `inf`, `-inf`, `nan` |
| `bool` | `boolean` | |
| `None` | `null` | |

## Supported Protocols

| Protocol | Python Version | PEP |
|----------|---------------|-----|
| 0 | all | |
| 1 | all | |
| 2 | 2.3+ | [PEP 307](https://peps.python.org/pep-0307/) |
| 3 | 3.0+ | |
| 4 | 3.4+ | [PEP 3154](https://peps.python.org/pep-3154/) |
| 5 | 3.8+ | [PEP 574](https://peps.python.org/pep-0574/) |

For opcode-level details, see [Supported Opcodes](./SUPPORTED_OPCODES.md).

## License

MIT
