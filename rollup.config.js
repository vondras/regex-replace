import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { eslint } from 'rollup-plugin-eslint'
import builtins from 'builtin-modules'
import filesize from 'rollup-plugin-filesize'
import json from 'rollup-plugin-json'
import { bin } from './package.json'

export default [{
  input: 'index.js',
  external: [].concat(builtins),
  plugins: [
    eslint({ exclude: '*.json' }),
    nodeResolve({}),
    commonjs({}),
    json({ compact: true }),
    filesize()
  ],
  output: {
    file: bin,
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  }
}]
