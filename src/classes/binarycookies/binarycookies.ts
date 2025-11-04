import { readFileSync, writeFileSync } from 'node:fs';

import { Page } from '#classes/page';
import { CursorBuffer } from '#utils/cursor-buffer';
import { printEnd } from '#utils/print';

/*
| Field           | Endianness | Type                 | Size        | Description                             |
| --------------- | ---------- | -------------------- | ----------- | --------------------------------------- |
| Magic           | BE         | UTF-8                | 4           | "cook", no terminator                   |
| Number of pages | BE         | Unsigned Int         | 4           |                                         |
| Page N size     | BE         | Unsigned Int         | 4           | Repeat for N pages                      |
| Page N          |            |                      | Page N size | Page N content                          |
| Checksum        | BE         | Unsigned Int         | 4           | Sum every 4th byte for each page        |
| Footer          | BE         |                      | 8           | 0x071720050000004b                      |
| Metadata        |            | Binary Property List |             | Contains NSHTTPCookieAcceptPolicy value |
*/
export class BinaryCookies {
  #pages: Page[] = [];
  #metadata: Buffer;
  #filePath: string;
  #inputChecksum: number;
  #canNotValidate: boolean = false;
  #debug: boolean = false;
  #initialBuffer: Buffer | undefined;

  constructor(filePath: string, debug = false) {
    this.#debug = debug;
    this.#filePath = filePath;
    const buffer = readFileSync(filePath);

    if (debug) {
      this.#initialBuffer = Buffer.from(buffer);
    }

    const cursorBuffer = new CursorBuffer(buffer);
    const magic = cursorBuffer.read(4);
    if (magic.toString('utf-8') !== 'cook') {
      throw new Error(`Expected magic bytes 'cook', got ${magic.toString('utf-8')}`);
    }
    const numberOfPages = cursorBuffer.readUInt32BE();
    const pageSizes = [];

    for (let i = 0; i < numberOfPages; i++) {
      const pageSize = cursorBuffer.readUInt32BE();
      pageSizes.push(pageSize);
    }

    for (let i = 0; i < numberOfPages; i++) {
      const pageBuffer = cursorBuffer.read(pageSizes[i]!);
      const page = new Page(pageBuffer);
      this.#pages.push(page);
    }

    const checksum = cursorBuffer.readUInt32BE();
    this.#inputChecksum = checksum;
    cursorBuffer.read(8); // footer
    const metadata = cursorBuffer.readAll();
    this.#metadata = metadata;
  }

  validateChecksum(): void {
    if (this.#canNotValidate) {
      throw new Error('Cookies modified, cannot validate checksum');
    }

    let calculatedChecksum = 0;
    for (let i = 0; i < this.#pages.length; i++) {
      calculatedChecksum += this.#pages[i]!.checksum;
    }

    if (calculatedChecksum !== this.#inputChecksum) {
      console.log('Initial cookie checksum verification failed; cowardly refusing to continue\n');
      console.log('Calculated checksum:', calculatedChecksum);
      console.log('Input checksum:', this.#inputChecksum);

      if (this.#debug) {
        console.log('Initial buffer:', this.#initialBuffer?.toString('hex'));
        console.log('Serialized buffer:', this.serialize().toString('hex'));
      }

      process.exit(1);
    }
  }

  filter(regexes: [string, RegExp][]): void {
    this.#canNotValidate = true;

    for (const page of this.#pages) {
      page.filter(regexes);
    }
  }

  deleteCookies(regexes: [string, RegExp][]): void {
    this.#canNotValidate = true;

    for (const page of this.#pages) {
      page.deleteCookies(regexes);
    }
  }

  countCookies(): number {
    return this.#pages.reduce((sum, page) => sum + page.numCookies, 0);
  }

  serialize(): Buffer {
    const pageSizes: number[] = [];
    const pageBuffers: Buffer[] = [];
    let checksum = 0;

    for (const page of this.#pages) {
      const pageBuffer = page.serialize();
      pageSizes.push(pageBuffer.length);
      pageBuffers.push(pageBuffer);
      checksum += page.checksum;
    }

    const metadataBuffer = this.#metadata;
    const totalSize =
      4 +
      4 +
      pageSizes.length * 4 +
      pageBuffers.reduce((sum, buf) => sum + buf.length, 0) +
      4 +
      8 +
      metadataBuffer.length;
    const buffer = Buffer.alloc(totalSize);
    let offset = 0;

    buffer.write('cook', offset);
    offset += 4;

    buffer.writeUInt32BE(this.#pages.length, offset);
    offset += 4;

    for (const size of pageSizes) {
      buffer.writeUInt32BE(size, offset);
      offset += 4;
    }

    for (const pageBuffer of pageBuffers) {
      pageBuffer.copy(buffer, offset);
      offset += pageBuffer.length;
    }

    buffer.writeUInt32BE(checksum, offset);
    offset += 4;

    buffer.writeBigUInt64BE(0x071720050000004bn, offset);
    offset += 8;

    metadataBuffer.copy(buffer, offset);

    return buffer;
  }

  write(filePath: string = this.#filePath): void {
    const buffer = this.serialize();
    writeFileSync(filePath, buffer);
  }

  print() {
    for (const page of this.#pages) {
      page.print();
    }

    printEnd();
  }
}
