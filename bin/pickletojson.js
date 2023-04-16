#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
const { Parser } = require('../dist/index');

const argv = process.argv;
const pkl = fs.readFileSync(path.join(argv[2]), 'binary');
const buffer = Buffer.from(pkl, 'binary');
const parser = new Parser(buffer);
const obj = parser.load();

const replacer = (_, value) => (typeof value === 'bigint' ? value.toString() : value);
const json = JSON.stringify(obj, replacer);
fs.writeFileSync(argv[3], json, 'utf8');