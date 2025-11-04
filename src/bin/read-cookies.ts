#!/usr/bin/env node

import path from 'node:path';

import parseArgs from 'minimist';

import { BinaryCookies } from '#classes/binarycookies';
import { validateRegexps } from '#utils/validate-regexps';

const args = parseArgs(process.argv.slice(2));

let file = args._[0];
const regExps = args._.slice(1);

if (!file) {
  console.error('Usage: read-cookie-file <file> [regex1] [regex2] ...');
  process.exit(1);
} else if (file.toLowerCase() === 'safari') {
  file = `${process.env.HOME}/Library/Containers/com.apple.Safari/Data/Library/Cookies/Cookies.binarycookies`;
}

const regexes = validateRegexps(regExps);
const filePath = path.resolve(file);
const binaryCookies = new BinaryCookies(filePath);

if (regexes.length) {
  binaryCookies.filter(regexes);
}

binaryCookies.print();
