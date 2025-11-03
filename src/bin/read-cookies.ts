#!/usr/bin/env node

import path from 'node:path';
import { BinaryCookies } from '#classes/binarycookies';

const file = process.argv[2];
const rawRegex = process.argv[3];

if (!file) {
  console.error('Usage: read-cookie-file <file>');
  process.exit(1);
}

let regex: RegExp | undefined;

if (rawRegex) {
  try {
    regex = new RegExp(rawRegex);
  } catch (error) {
    console.error('Invalid regex:', error);
    process.exit(1);
  }
}

const filePath = path.resolve(file) as string;
const binaryCookies = new BinaryCookies(filePath);

if (regex) {
  binaryCookies.filter(regex);
}

binaryCookies.print();
