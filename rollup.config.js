import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json'));

const banner = `/**
 * ${pkg.name}
 * ${pkg.homepage}
 *
 * Copyright (c) ${new Date().getFullYear()} ${pkg.author.name} <${pkg.author.email}>
 */
`;

export default [
  {
    input: './src/index.ts',
    output: [
      {
        sourcemap: true,
        file: pkg.module,
        format: 'esm',
        banner,
      },
      {
        sourcemap: true,
        file: pkg.main,
        format: 'cjs',
        banner,
      },
      {
        sourcemap: true,
        file: pkg.unpkg,
        format: 'umd',
        name: pkg.global,
        banner,
        plugins: [terser()],
      },
    ],
    external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies || {})),
    plugins: [
      typescript(),
      resolve(),
      commonjs(),
      replace({
        // eslint-disable-next-line no-undef
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV) || 'production',
        __VERSION__: JSON.stringify(pkg.version),
      }),
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
        file: pkg.types,
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
