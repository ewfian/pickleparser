#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
const { Parser } = require('../dist/index');

const argv = process.argv;
const pkl = fs.readFileSync(path.join(argv[2]), 'binary');
const buffer = Buffer.from(pkl, 'binary');
const parser = new Parser();
const obj = parser.parse(buffer);

const replacer = (_, value) => {
    if (value instanceof Map) {
        return Object.fromEntries(value);
    }
    if (value instanceof Set) {
        return Array.from(value);
    }
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
};
const json = JSON.stringify(obj, replacer);
fs.writeFileSync(argv[3], json, 'utf8');
