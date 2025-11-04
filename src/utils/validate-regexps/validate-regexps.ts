export function validateRegexps(regexps: string[]): Array<[string, RegExp]> {
  const result: Array<[string, RegExp]> = [];

  for (const input of regexps) {
    let fieldName = '*';
    let regexPattern = input;
    let flags = '';

    // Check if input has @fieldName or @fieldName:flags prefix
    const match = input.match(/^@(\w+|\*)(?::([a-z]+))?\s+(.+)$/);
    if (match) {
      fieldName = match[1]!.toLowerCase();
      flags = match[2] || '';
      regexPattern = match[3]!;
    } else if (input.startsWith('@')) {
      // If input starts with an @ and it doesn't match the pattern, it's invalid
      console.error('Invalid regex:', input);
      console.error('If you intended to search for a literal @, use \\@');
      process.exit(1);
    }

    // Validate the regex pattern
    try {
      const regex = new RegExp(regexPattern, flags);
      result.push([fieldName, regex]);
    } catch {
      console.error('Invalid regex:', regexPattern);
      process.exit(1);
    }
  }

  return result;
}
