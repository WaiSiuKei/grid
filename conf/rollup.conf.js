import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import scss from 'rollup-plugin-scss';
import uglify from 'rollup-plugin-uglify-es';

const pkg = require('../package.json');

const libraryName = 'NilaGrid';

export default {
  input: `src/index.ts`,
  output: [
    { file: pkg.main, name: libraryName, format: 'umd', sourcemap: false },
  ],
  sourceMap: false,
  external: [],
  plugins: [
    scss({
      //Choose *one* of these possible "output:..." options
      // Default behaviour is to write all styles to the bundle destination where .js is replaced by .css
      output: 'dist/grid.css',

      // Determine if node process should be terminated on error (default: false)
      failOnError: true,
    }),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    resolve(),
    commonjs(),
    // uglify()
  ]

};
