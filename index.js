import fs from 'fs'
import assert from 'assert'
import vm from 'vm'
import { Transform, PassThrough, pipeline } from 'stream'
import ReadlineTransform from 'readline-transform'
import program from 'commander'
import { version } from './package.json'

function collect (val, memo) {
  memo.push(val)
  return memo
}

class FlagSet extends Set {
  set (flag = '') {
    assert(typeof flag === 'string', TypeError('Flag must be a string'))

    if (flag.length === 1) {
      const _flag = flag.toLowerCase()
      assert(FlagSet.validFlags.has(_flag), RangeError('Flag must be a valid RegExp flag'))
      return flag === _flag ? this.add(flag) : this.delete(flag)
    } else {
      for (let letter of flag) {
        this.set(letter)
      }
      return this
    }
  }

  toString () {
    return [...this].join('')
  }
}

FlagSet.validFlags = new FlagSet('gumi')

class RegexReplaceTransform extends Transform {
  constructor (regex, replacer, options = {}) {
    options.objectMode = true
    super(options)
    this.regex = regex
    this.replacer = replacer
  }

  _transform (data, encoding, callback) {
    const line = data.toString()
    try {
      this.push(line.replace(this.regex, this.replacer) + '\n')
      callback()
    } catch (err) {
      callback(err)
    }
  }
}

class FilterTransform extends Transform {
  constructor (filter, options = {}) {
    options.objectMode = true
    super(options)
    this.filter = filter
  }

  _transform (data, encoding, callback) {
    const line = data.toString()
    try {
      if (this.filter(line)) {
        this.push(line)
      }
      callback()
    } catch (err) {
      callback(err)
    }
  }
}

function parseReplacement (delimiter, escapeChar, globalFlags) {
  const escaper = RegExp(escapeChar, 'g')
  const splitter = RegExp(`(?<!${escapeChar})${delimiter}`, 'g')
  return function parse (pair) {
    const components = pair.split(splitter)
    assert(components.length > 1 && components.length <= 3,
      `Replacement pattern is not well formed, should have at least one and fewer than three delimiters: ${pair} ${components}`)

    let [ pattern, replacement, flags = '' ] = components
    assert(pattern !== '', RangeError('Pattern cannot be blank'))

    replacement = replacement.replace(escaper, '')

    if (/^(fn|javascript):\s*\([^)]+\)\s*=>\s*\{?[^}]*\}?$/.test(replacement)) {
      const code = `;(${replacement.replace(/^(fn|javascript):\s*/, '')})(...args)`
      replacement = function (...args) {
        const sandbox = {
          args
        }

        return vm.runInNewContext(code, sandbox)
      }
    }

    const localFlags = new FlagSet(globalFlags)

    localFlags.set(flags)

    pattern = RegExp(pattern, localFlags)

    return new RegexReplaceTransform(pattern, replacement)
  }
}

function regexFilters (filters, firstLike = true) {
  return function filterLine (line) {
    for (let filter of filters) {
      if (firstLike === filter.regex.test(line)) return firstLike
    }
  }
}

program
  .version(version)
  .usage('[options] <file> [pairs...]')
  .option('-i, ignore-case', 'Globally set ignore case RegExp flag')
  .option('-g, --global', 'Globally set global RegExp flag')
  .option('-u, --unicode', 'Globally set unicode RegExp flag')
  .option('-m, --multiline', 'Globally set multiline RegExp flag')
  .option('-r, --replace <replacer>', 'Pattern and replacement of the form "/pattern/replacement/flags"', collect, [])
  .option('-d, --delimiter <character>', 'Set the pattern/replacement/flags delimiter', '/')
  .option('-e, --escape <character>', 'Set the delimiter escape character', '\\\\')
  .option('-f, --filter', 'Filter output to modified only')
  .option('-o, --output <file>', 'Output file')
  .arguments('[file]')
  .action((file) => {
    // God loves flags
    let flags = ''
    if (program.ignoreCase) flags += 'i'
    if (program.global) flags += 'g'
    if (program.multiline) flags += 'm'
    if (program.unicode) flags += 'u'

    const globalFlags = new FlagSet(flags)

    const replacements = program.replace
      .map(parseReplacement(program.delimiter, program.escape, globalFlags))

    const filter = program.filter ? new FilterTransform(regexFilters(replacements)) : new PassThrough()

    const input = file ? fs.createReadStream(file) : process.stdin
    const output = program.output ? fs.createReadStream(program.output) : process.stdout

    const lineReader = new ReadlineTransform()

    return pipeline(
      input,
      lineReader,
      filter,
      ...replacements,
      output
    ).on('error', err => { throw err })
  })

program.parse(process.argv)
