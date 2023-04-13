#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
const { Parser } = require('../dist/index');

const argv = process.argv;
const pkl = fs.readFileSync(path.join(argv[2]), 'binary');
const buffer = Buffer.from(pkl, 'binary');
const parser = new Parser(buffer);
const obj = parser.load();
const json = JSON.stringify(obj);
fs.writeFileSync(argv[3], json, 'utf8');