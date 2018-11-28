module.exports = {
  root: true,
  env: {
    browser: false,
    node: true
  },
  parserOptions: {
    ecmaVersion: 9,
    parser: 'babel-eslint'
  },
  'extends': [
    'standard'
  ],
  rules: {
    'standard/object-curly-even-spacing': [2, 'either'],
    'standard/array-bracket-even-spacing': [2, 'either'],
    'standard/computed-property-even-spacing': [2, 'even'],
    'standard/no-callback-literal': [2, ['cb', 'callback']],
    eqeqeq: 0
  }
}
