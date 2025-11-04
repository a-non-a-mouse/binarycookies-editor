import { CursorBuffer } from '#utils/cursor-buffer';
import { Cookie } from '#classes/cookie';

/*
| Field             | Endianness | Type         | Size          | Description          |
| ----------------- | ---------- | ------------ | ------------- | -------------------- |
| Header            | BE         |              | 4             | 0x00000100           |
| Number of cookies | LE         | Unsigned Int | 4             |                      |
| Cookie N offset   | LE         | Unsigned Int | 4             | Repeat for N cookies |
| Footer            |            |              | 4             | 0x00000000           |
| Cookie N          |            |              | Cookie N size | Cookie N content     |
*/
export class Page {
  #cookies: Cookie[] = [];

  constructor(buffer: Buffer) {
    const cursorBuffer = new CursorBuffer(buffer);
    cursorBuffer.read(4); // header
    const numberOfCookies = cursorBuffer.readUInt32LE();
    const cookieOffsets = [];
    for (let i = 0; i < numberOfCookies; i++) {
      const cookieOffset = cursorBuffer.readUInt32LE();
      cookieOffsets.push(cookieOffset);
    }
    cursorBuffer.read(4); // footer

    for (let i = 0; i < numberOfCookies; i++) {
      const cookieBuffer =
        i < numberOfCookies - 1
          ? cursorBuffer.read(cookieOffsets[i + 1]! - cookieOffsets[i]!)
          : cursorBuffer.readAll();
      const cookie = new Cookie(cookieBuffer);
      this.#cookies.push(cookie);
    }
  }

  filter(regexes: [string, RegExp][]): void {
    this.#cookies = this.#cookies.filter((cookie) => cookie.test(regexes));
  }

  deleteCookies(regexes: [string, RegExp][]): void {
    this.#cookies = this.#cookies.filter((cookie) => !cookie.test(regexes));
  }

  serialize(): Buffer {
    const cookieBuffers = this.#cookies.map((cookie) => cookie.serialize());

    const headerSize = 4 + 4 + this.#cookies.length * 4 + 4;
    const totalSize = headerSize + cookieBuffers.reduce((sum, buf) => sum + buf.length, 0);

    const buffer = Buffer.alloc(totalSize);
    let offset = 0;

    buffer.writeUInt32BE(0x00000100, offset);
    offset += 4;

    buffer.writeUInt32LE(this.#cookies.length, offset);
    offset += 4;

    let cookieDataOffset = headerSize;
    for (let i = 0; i < this.#cookies.length; i++) {
      buffer.writeUInt32LE(cookieDataOffset, offset);
      offset += 4;
      cookieDataOffset += cookieBuffers[i]!.length;
    }

    buffer.writeUInt32LE(0x00000000, offset);
    offset += 4;

    for (const cookieBuffer of cookieBuffers) {
      cookieBuffer.copy(buffer, offset);
      offset += cookieBuffer.length;
    }

    return buffer;
  }

  get checksum(): number {
    const serialized = this.serialize();
    let sum = 0;
    for (let i = 0; i < serialized.length; i += 4) {
      sum += serialized[i]!;
    }
    return sum;
  }

  get numCookies(): number {
    return this.#cookies.length;
  }

  print() {
    for (const cookie of this.#cookies) {
      cookie.print();
    }
  }
}
