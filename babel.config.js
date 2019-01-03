module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: 'commonjs'
    }]
  ],
  plugins: [
    // '@babel/plugin-proposal-export-default-from',
    // '@babel/plugin-transform-runtime',
    // ['@babel/plugin-proposal-decorators', { legacy: true }],
    // '@babel/plugin-proposal-export-namespace-from',
    // '@babel/plugin-syntax-dynamic-import',
    // '@babel/plugin-syntax-import-meta',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
  ]
};
