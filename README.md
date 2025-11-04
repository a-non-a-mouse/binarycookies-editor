# binarycookies

Library and tools for working with Apple's .binarycookies files.

## Installation

```bash
npm install
npm run build
```

## Command Line Tools

### Regular Expression Format

Both command-line tools support an extended regex format that allows you to specify which cookie field to match against and optional regex flags:

- `regexPattern` - Matches against all cookie data
- `@fieldName regexPattern` - Matches against a specific cookie field
- `@fieldName:i regexPattern` - Case insensitive search against a specific cookie field
- `@*:i regexPattern` - Case insensitve search against all cookie data

Valid field names are: url, name, path, value, comment, commenturl

**Examples:**

```bash
npx read-cookies Cookies.binarycookies example.com
npx read-cookies Cookies.binarycookies "@url google"
npx read-cookies Cookies.binarycookies "@url:i gOOgLe"
npx read-cookies Cookies.binaryCookies "@url ^(.*\.)?(github\.com|google\.com|youtube\.com)$"
```

### Safari Cookies

If you use the literal string "Safari" as a file path, it will read cookies from `~/Library/Containers/com.apple.Safari/Data/Library/Cookies/Cookies.binarycookies`

### read-cookies

Reads and displays cookies from a binarycookies file. Optionally filters cookies by one or more regular expressions.

**Usage:**

```bash
npx read-cookies <file> [regex1] [regex2] ... [--format=table|json]
```

**Examples:**

```bash
npx read-cookies Safari
npx read-cookies Safari google --format=json
npx read-cookies /path/to/Cookies.binarycookies ^example "@url google\.com$"
```

### filter-cookies

Filters cookies in a binarycookies file to only those matching one or more regular expressions and writes the filtered results to a file

**Usage:**

```bash
npx filter-cookies <file> [regex1] [regex2] ... (--output=output-file | --inplace)
```

**Examples:**

```bash
npx filter-cookies Safari "google\.com$" --output=filtered.binarycookies
npx filter-cookies /path/to/Cookies.binarycookies "google\.com$" --inplace
```

### delete-cookies

Deletes cookies in a binarycookies file that match one or more regular expressions and writes the filtered results to a file

**Usage:**

```bash
npx delete-cookies <file> [regex1] [regex2] ... (--output=output-file | --inplace)
```

**Examples:**

```bash
npx delete-cookies Safari "google\.com$" --output=filtered.binarycookies
npx delete-cookies /path/to/Cookies.binarycookies "google\.com$" --inplace
```
