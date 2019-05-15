/**
 * @module rollup
 * @license MIT
 * @version 2018/03/28
 */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const terser = require('terser');
const rollup = require('rollup');
const pkg = require('./package.json');
const typescript = require('rollup-plugin-typescript2');

/**
 * @function build
 * @param {Object} inputOptions
 * @param {Object} outputOptions
 */
async function build(inputOptions, outputOptions) {
  await fs.remove('dist');

  const bundle = await rollup.rollup(inputOptions);

  await bundle.write(outputOptions);

  const file = outputOptions.file;

  console.log(`Build ${file} success!`);

  const min = file.replace(/\.js$/i, '.min.js');
  const map = `${file}.map`;

  const minify = terser.minify(
    { 'image-ready.js': (await fs.readFile(path.resolve(file))).toString() },
    { ie8: true, mangle: { eval: true }, sourceMap: { url: path.basename(map) } }
  );

  await fs.outputFile(min, outputOptions.banner + minify.code);
  console.log(`Build ${min} success!`);

  await fs.outputFile(map, minify.map);
  console.log(`Build ${map} success!`);
}

const banner = `/**
 * @module ${pkg.name}
 * @author aui
 * @author ${pkg.author.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

const inputOptions = {
  context: 'window',
  input: 'image-ready.ts',
  plugins: [typescript({ clean: true })]
};

const outputOptions = {
  banner,
  indent: true,
  strict: true,
  format: 'umd',
  name: 'imageReady',
  amd: { id: 'imageReady' },
  file: 'dist/image-ready.js'
};

build(inputOptions, outputOptions);
