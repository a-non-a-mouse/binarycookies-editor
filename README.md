# binarycookies

Library and tools for working with Apple's .binarycookies files.

## Installation

```bash
npm install
npm run build
```

## Command Line Tools

### read-cookies

Reads and displays cookies from a binarycookies file. Optionally filters cookies by a regular expression.

**Usage:**

```bash
npx read-cookies <file> [regex]
```

**Arguments:**

- `file` - Path to the .binarycookies file (required)
- `regex` - Optional regular expression to filter cookies by name

**Examples:**

```bash
# Read all cookies from a file
npx read-cookies Cookies.binarycookies

# Read only cookies matching a pattern
npx read-cookies Cookies.binarycookies "^example"
```

### filter-cookies

Filters cookies from a binarycookies file using a regular expression and writes the filtered results to a new file.

**Usage:**

```bash
npx filter-cookies <file> <regex> [output-file] [--debug]
```

**Arguments:**

- `file` - Path to the input .binarycookies file (required)
- `regex` - Regular expression to filter cookies by name (required)
- `output-file` - Optional path for the output file. If not provided, the input file is overwritten

**Examples:**

```bash
# Filter Safari's cookies and delete any not from google.com
npx filter-cookies ~/Library/Containers/com.apple.Safari/Data/Library/Cookies/Cookies.binarycookies "google\.com$"

# Filter cookies and write to a specific file
npx filter-cookies Cookies.binarycookies "google\.com" filtered-cookies.binarycookies
```
