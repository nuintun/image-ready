/**
 * @module rollup.base
 */

import treeShake from './plugins/tree-shake';
import typescript from '@rollup/plugin-typescript';

/**
 * @function rollup
 * @param esnext
 * @param development
 */
export default function rollup(esnext) {
  const external = ['tslib'];

  return [
    {
      input: 'src/index.ts',
      preserveModules: true,
      output: {
        interop: false,
        exports: 'auto',
        esModule: false,
        preferConst: true,
        dir: esnext ? 'esm' : 'cjs',
        format: esnext ? 'esm' : 'cjs'
      },
      external,
      plugins: [typescript(), treeShake()],
      onwarn(error, warn) {
        if (error.code !== 'CIRCULAR_DEPENDENCY') {
          warn(error);
        }
      }
    }
  ];
}
