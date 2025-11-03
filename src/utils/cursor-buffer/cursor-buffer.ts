export class CursorBuffer {
  private buffer: Buffer;
  private cursor: number;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.cursor = 0;
  }

  read(bytes: number): Buffer {
    const data = this.buffer.subarray(this.cursor, this.cursor + bytes);
    this.cursor += bytes;
    return data;
  }

  readAll(): Buffer {
    const data = this.buffer.subarray(this.cursor);
    this.cursor += data.length;

    return data;
  }

  readUInt8(): number {
    const value = this.buffer.readUInt8(this.cursor);
    this.cursor += 1;
    return value;
  }

  readUInt16LE(): number {
    const value = this.buffer.readUInt16LE(this.cursor);
    this.cursor += 2;
    return value;
  }

  readUInt32LE(): number {
    const value = this.buffer.readUInt32LE(this.cursor);
    this.cursor += 4;
    return value;
  }

  readUInt16BE(): number {
    const value = this.buffer.readUInt16BE(this.cursor);
    this.cursor += 2;
    return value;
  }

  readUInt32BE(): number {
    const value = this.buffer.readUInt32BE(this.cursor);
    this.cursor += 4;
    return value;
  }

  readDoubleLE(): number {
    const value = this.buffer.readDoubleLE(this.cursor);
    this.cursor += 8;
    return value;
  }

  readNullTerminatedString(): string {
    let string = '';
    while (this.buffer[this.cursor] !== 0 && this.cursor < this.buffer.length) {
      string += String.fromCharCode(this.buffer[this.cursor]!);
      this.cursor++;
    }
    this.cursor++;

    return string;
  }
}
