# Regex Replace

> Search and destroy

A simple utility to modify lines of a file just like `String.prototype.replace`

## Why

* Stream based like `sed`
* Use all the regular expression syntax `sed` doesn't understand
* Change delimiters for strings with lots of `/` in them, like URLs
* Friendly error messages
* Chain multiple pattern/replacement pairs

## Installation

```bash
npm install
```

## Usage

```bash
$ regex-replace --help

  Usage: regex-replace [options] <file> [pairs...]

  Options:
    -V, --version                output the version number
    -i, ignore-case              Globally set ignore case RegExp flag
    -g, --global                 Globally set global RegExp flag
    -u, --unicode                Globally set unicode RegExp flag
    -m, --multiline              Globally set multiline RegExp flag
    -r, --replace <replacer>     Pattern and replacement of the form "/pattern/replacement/flags" (default: [])
    -d, --delimiter <character>  Set the pattern/replacement/flags delimiter (default: "/")
    -e, --escape <character>     Set the delimiter escape character (default: "\\\\")
    -f, --filter                 Filter output to modified only
    -o, --output <file>          Output file
    -h, --help                   output usage information

$ echo 'I hate being replaced! AAARGH!' |
  regex-replace -ig -r 'hate/love' -r 'replaced/a dog' -r '(?<=!\s+)a.*$/Woof!/m'
I love being a dog! Woof!

$ echo 'The 2nd rule of ornithology club is the 43rd rule of epistemology club.' |
  regex-replace -g -r '\w+(ology)/taut$1' -r '\d+\w{2}/1st'
The 1st rule of tautology club is the 1st rule of tautology club.
```

Global flags can be turned off for a specific pattern by specifying the uppercase version of the flag character in the pattern flags.

Simple arrow functions can be used as replacers by prefixing the replacement with `fn:` or `javascript:`.

## Build

```bash
npm run build
```

## TODO

Write a better README, and speed it up; it's not particulary fast.
