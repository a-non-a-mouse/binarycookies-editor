import { CursorBuffer } from '#utils/cursor-buffer';
import { appleDate } from '#utils/apple-date';
import { print, getOptions } from '#utils/print';

/*
| Field              | Endianness | Type         | Size (offset) | Description                                                             |
| ------------------ | ---------- | ------------ | ------------- | ----------------------------------------------------------------------- |
| Size               | LE         | Unsigned Int | 4 (0)         | Size in bytes                                                           |
| Version            | LE         | Unsigned Int | 4 (4)         | 0 or 1                                                                  |
| Flags              | LE         | Bit field    | 4 (8)         | isSecure = 1, isHTTPOnly = 1 << 2, unknown1 = 1 << 3, unknown2 = 1 << 4 |
| Has port           | LE         | Unsigned Int | 4 (12)        | 0 or 1                                                                  |
| URL Offset         | LE         | Unsigned Int | 4 (16)        | Offset from the start of the cookie                                     |
| Name Offset        | LE         | Unsigned Int | 4 (20)        | Offset from the start of the cookie                                     |
| Path Offset        | LE         | Unsigned Int | 4 (24)        | Offset from the start of the cookie                                     |
| Value Offset       | LE         | Unsigned Int | 4 (28)        | Offset from the start of the cookie                                     |
| Comment Offset     | LE         | Unsigned Int | 4 (32)        | Offset from the start of the cookie, 0x00000000 if not present          |
| Comment URL Offset | LE         | Unsigned Int | 4 (36)        | Offset from the start of the cookie, 0x00000000 if not present          |
| Expiration         | LE         | Double       | 8 (40)        | Number of seconds since 00:00:00 UTC on 1 January 2001                  |
| Creation           | LE         | Double       | 8 (48)        | Number of seconds since 00:00:00 UTC on 1 January 2001                  |
| Port               | LE         | Unsigned Int | 2 (56)        | Only present if the "Has port" field is 1                               |
| Comment            | LE         | String       |               | Null-terminated, optional                                               |
| Comment URL        | LE         | String       |               | Null-terminated, optional                                               |
| URL                | LE         | String       |               | Null-terminated                                                         |
| Name               | LE         | String       |               | Null-terminated                                                         |
| Path               | LE         | String       |               | Null-terminated                                                         |
| Value              | LE         | String       |               | Null-terminated                                                         |
| Metadata           |            | String       |               | Binary Property List of metadata                                        |
*/
export class Cookie {
  #version: number;
  #flags: number;
  #expiration: number;
  #creation: number;
  #port: number | undefined;
  #comment: string | undefined;
  #commentURL: string | undefined;
  #url: string;
  #name: string;
  #path: string;
  #value: string;
  #metadata: Buffer;

  constructor(buffer: Buffer) {
    const cursorBuffer = new CursorBuffer(buffer);

    cursorBuffer.readUInt32LE(); // size
    this.#version = cursorBuffer.readUInt32LE();
    this.#flags = cursorBuffer.readUInt32LE();
    const hasPort = cursorBuffer.readUInt32LE();
    cursorBuffer.read(16); // url offset, name offset, path offset, value offset
    const commentOffset = cursorBuffer.readUInt32LE();
    const commentURLOffset = cursorBuffer.readUInt32LE();
    this.#expiration = cursorBuffer.readDoubleLE();
    this.#creation = cursorBuffer.readDoubleLE();
    this.#port = hasPort ? cursorBuffer.readUInt16LE() : undefined;
    this.#comment = commentOffset ? cursorBuffer.readNullTerminatedString() : undefined;
    this.#commentURL = commentURLOffset ? cursorBuffer.readNullTerminatedString() : undefined;
    this.#url = cursorBuffer.readNullTerminatedString();
    this.#name = cursorBuffer.readNullTerminatedString();
    this.#path = cursorBuffer.readNullTerminatedString();
    this.#value = cursorBuffer.readNullTerminatedString();
    this.#metadata = cursorBuffer.readAll();
  }

  test(regexes: [string, RegExp][]): boolean {
    return regexes.some(([fieldName, regex]) => {
      switch (fieldName) {
        case 'url':
          return regex.test(this.#url);
        case 'name':
          return regex.test(this.#name);
        case 'path':
          return regex.test(this.#path);
        case 'value':
          return regex.test(this.#value);
        case 'comment':
          return regex.test(this.#comment ?? '');
        case 'commenturl':
          return regex.test(this.#commentURL ?? '');
        case '*':
          return (
            regex.test(this.#url) ||
            regex.test(this.#name) ||
            regex.test(this.#path) ||
            regex.test(this.#value) ||
            regex.test(this.#comment ?? '') ||
            regex.test(this.#commentURL ?? '')
          );
        default:
          return false;
      }
    });
  }

  serialize(): Buffer {
    const urlBuffer = Buffer.from(this.#url + '\0');
    const nameBuffer = Buffer.from(this.#name + '\0');
    const pathBuffer = Buffer.from(this.#path + '\0');
    const valueBuffer = Buffer.from(this.#value + '\0');
    const metadataBuffer = this.#metadata;
    const commentBuffer = this.#comment ? Buffer.from(this.#comment + '\0') : null;
    const commentURLBuffer = this.#commentURL ? Buffer.from(this.#commentURL + '\0') : null;
    const portSize = this.#port !== undefined ? 2 : 0;

    const totalSize =
      56 +
      portSize +
      (commentBuffer?.length ?? 0) +
      (commentURLBuffer?.length ?? 0) +
      urlBuffer.length +
      nameBuffer.length +
      pathBuffer.length +
      valueBuffer.length +
      metadataBuffer.length;

    const buffer = Buffer.alloc(totalSize);
    let dataOffset = 56 + portSize;

    buffer.writeUInt32LE(totalSize, 0);
    buffer.writeUInt32LE(this.#version, 4);
    buffer.writeUInt32LE(this.#flags, 8);
    buffer.writeUInt32LE(this.#port !== undefined ? 1 : 0, 12);
    buffer.writeDoubleLE(this.#expiration, 40);
    buffer.writeDoubleLE(this.#creation, 48);

    if (this.#port !== undefined) {
      buffer.writeUInt16LE(this.#port, 56);
    }

    if (commentBuffer) {
      buffer.writeUInt32LE(dataOffset, 32);
      commentBuffer.copy(buffer, dataOffset);
      dataOffset += commentBuffer.length;
    } else {
      buffer.writeUInt32LE(0, 32);
    }

    if (commentURLBuffer) {
      buffer.writeUInt32LE(dataOffset, 36);
      commentURLBuffer.copy(buffer, dataOffset);
      dataOffset += commentURLBuffer.length;
    } else {
      buffer.writeUInt32LE(0, 36);
    }

    buffer.writeUInt32LE(dataOffset, 16);
    urlBuffer.copy(buffer, dataOffset);
    dataOffset += urlBuffer.length;

    buffer.writeUInt32LE(dataOffset, 20);
    nameBuffer.copy(buffer, dataOffset);
    dataOffset += nameBuffer.length;

    buffer.writeUInt32LE(dataOffset, 24);
    pathBuffer.copy(buffer, dataOffset);
    dataOffset += pathBuffer.length;

    buffer.writeUInt32LE(dataOffset, 28);
    valueBuffer.copy(buffer, dataOffset);
    dataOffset += valueBuffer.length;

    metadataBuffer.copy(buffer, dataOffset);

    return buffer;
  }

  print() {
    const flags = this.#flags;
    const isSecure = !!(flags & 1);
    const isHTTPOnly = !!(flags & 4);
    const SameSite = ['Default', 'Lax', 'None', 'Strict'][(flags & 24) >> 3];
    const { debug } = getOptions();

    const data = {
      version: debug ? this.#version : undefined,
      flags: debug ? this.#flags.toString(2) : undefined,
      isSecure,
      isHTTPOnly,
      SameSite,
      expiration: appleDate(this.#expiration).toISOString(),
      creation: appleDate(this.#creation).toISOString(),
      port: this.#port,
      comment: this.#comment,
      commentURL: this.#commentURL,
      url: this.#url,
      name: this.#name,
      path: this.#path,
      value: this.#value,
      metadata: debug ? this.#metadata.toString('hex') : undefined,
    };

    print(data);
  }
}
