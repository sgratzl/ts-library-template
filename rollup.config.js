import commonjs from '@rollup/plugin-commonjs';
import resolve from 'rollup-plugin-pnp-resolve';
import cleanup from 'rollup-plugin-cleanup';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

const banner = `/**
 * ts-library-template
 * https://github.com/sgratzl/ts-library-template
 *
 * Copyright (c) 2020 Samuel Gratzl <sam@sgratzl.com>
 */
`;

export default [
  {
    input: './src/index.ts',
    output: [
      {
        sourcemap: true,
        file: 'dist/index.esm.js',
        format: 'esm',
        banner,
      },
      {
        sourcemap: true,
        file: 'dist/index.js',
        format: 'umd',
        name: pkg.global,
        banner,
      },
      {
        sourcemap: true,
        file: 'dist/index.min.js',
        format: 'umd',
        name: pkg.global,
        banner,
        plugins: [terser()],
      },
    ],
    external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
    plugins: [
      replace({
        // eslint-disable-next-line no-undef
        'process.env.NODE_ENV': process.env.NODE_ENV || 'production',
      }),
      resolve(),
      commonjs(),
      typescript(),
      cleanup({
        comments: ['some', 'ts', 'ts3s'],
        extensions: ['ts', 'tsx', 'js', 'jsx'],
        include: './src/**/*',
      }),
    ],
  },
  {
    input: './src/index.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es',
        banner,
      },
    ],
    external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
  },
];
