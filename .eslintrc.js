// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    es6: true,
    browser: true,
  },
  // required to lint *.vue files
  // check if imports actually resolve
  // add your custom rules here
  'rules': {
    'no-unused-vars': 2,
    'no-undef': 'error'
  }
};
