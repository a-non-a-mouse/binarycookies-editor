#!/usr/bin/env node

import path from 'node:path';
import { BinaryCookies } from '#classes/binarycookies';

const file = process.argv[2];
const rawRegex = process.argv[3];
let outputFile = process.argv[4];
let debug = false;

if (outputFile === '--debug') {
  outputFile = undefined;
  debug = true;
} else if (process.argv[5] === '--debug') {
  debug = true;
}

let regex: RegExp;

if (!file || !rawRegex) {
  console.error('Usage: filter-cookies <file> <regex> [output-file]');
  process.exit(1);
}

try {
  regex = new RegExp(rawRegex);
} catch (error) {
  console.error('Invalid regex:', error);
  process.exit(1);
}

const filePath = path.resolve(file) as string;
const binaryCookies = new BinaryCookies(filePath, debug);
binaryCookies.validateChecksum();
binaryCookies.filter(regex);
binaryCookies.write(outputFile);

let numCookies = binaryCookies.countCookies();
console.log(`Wrote ${numCookies} cookies`);
