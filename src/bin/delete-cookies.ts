#!/usr/bin/env node

import path from 'node:path';

import parseArgs from 'minimist';

import { BinaryCookies } from '#classes/binarycookies';
import { validateRegexps } from '#utils/validate-regexps';

const args = parseArgs(process.argv.slice(2));

const usage = `Usage: delete-cookies <file> [regex1] [regex2] ... (--output=output-file | --inplace)`;
let file = args._[0];
const regExps = args._.slice(1);
let outputFile: string | undefined;
let debug = false;

if (args.debug) {
  debug = true;
}

if (!file || !regExps.length) {
  console.error(usage);
  process.exit(1);
} else if (file.toLowerCase() === 'safari') {
  file = `${process.env.HOME}/Library/Containers/com.apple.Safari/Data/Library/Cookies/Cookies.binarycookies`;
}

if (args.output) {
  outputFile = args.output;
} else if (args.inplace) {
  outputFile = file;
} else {
  console.error(usage);
  process.exit(1);
}

const regexes = validateRegexps(regExps);
const filePath = path.resolve(file) as string;
const binaryCookies = new BinaryCookies(filePath, debug);
binaryCookies.validateChecksum();
binaryCookies.deleteCookies(regexes);
binaryCookies.write(outputFile);

let numCookies = binaryCookies.countCookies();
console.log(`Wrote ${numCookies} cookies`);
