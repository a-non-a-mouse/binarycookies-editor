import parseArgs from 'minimist';

const args = parseArgs(process.argv.slice(2));
const format = args.format || args.f;
let index = 0;
const columnWidth = process.stdout.columns;

type primitive = string | number | boolean | null | undefined;

function printTable(data: Record<string, primitive>) {
  const maxKeyLength = Math.max(...Object.keys(data).map((key) => key.length)) + 1;
  const dataLength = columnWidth - maxKeyLength - 2;

  if (index > 0) {
    console.log(new Array(columnWidth).fill('─').join(''));
  }

  for (const [key, value] of Object.entries(data)) {
    const paddedKey = ` ${key}`.padEnd(maxKeyLength + 1);
    const valueStr = String(value);

    // Print first line with key
    console.log(paddedKey + valueStr.slice(0, dataLength));

    // Print continuation lines if value is longer than dataLength
    let offset = dataLength;
    while (offset < valueStr.length) {
      const spaces = ' '.repeat(maxKeyLength + 1);
      console.log(spaces + valueStr.slice(offset, offset + dataLength));
      offset += dataLength;
    }
  }
}

function printJson(data: Record<string, primitive>) {
  if (index === 0) {
    console.log('{');
  }
  if (index > 0) {
    console.log('  },');
  }

  const JSONString = JSON.stringify(data, null, 2)
    .split('\n')
    .slice(0, -1)
    .map((line) => `  ${line}`)
    .join('\n');
  console.log(JSONString);
}

function filterData(data: Record<string, primitive>) {
  return Object.fromEntries(Object.entries(data).filter(([_key, value]) => value != null));
}

export function print(data: Record<string, primitive>) {
  const filteredData = filterData(data);

  if (format === 'json') {
    printJson(filteredData);
  } else {
    // default = table
    printTable(filteredData);
  }

  index++;
}

export function printEnd() {
  if (format === 'json') {
    if (index > 0) {
      console.log('  }');
    }
    console.log('}');
  }
}

export function getOptions() {
  return {
    debug: Boolean(args.debug),
  };
}
