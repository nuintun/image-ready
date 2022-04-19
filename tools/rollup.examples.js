/**
 * @module rollup.examples
 */

import pkg from '../package.json';
import treeShake from './plugins/tree-shake';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const banner = `/**
 * @module ${pkg.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @author ${pkg.author.name}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

export default [
  {
    input: 'examples/raf.ts',
    output: {
      banner,
      format: 'umd',
      name: 'raf',
      interop: false,
      exports: 'auto',
      esModule: false,
      amd: { id: 'raf' },
      file: 'examples/raf.js'
    },
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    },
    plugins: [resolve(), typescript({ tsconfig: 'examples/tsconfig.json' }), treeShake()]
  },
  {
    input: 'examples/index.ts',
    output: {
      banner,
      format: 'umd',
      name: 'index',
      interop: false,
      exports: 'auto',
      esModule: false,
      amd: { id: 'index' },
      file: 'examples/index.js'
    },
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    },
    plugins: [resolve(), typescript({ tsconfig: 'examples/tsconfig.json' }), treeShake()]
  }
];
