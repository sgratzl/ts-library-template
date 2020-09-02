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

/**
 * defines which formats (umd, esm, cjs, types) should be built when watching
 */
const watchOnly = ['umd'];

export default (options) => {
  const buildFormat = (format) => {
    return !options.watch || watchOnly.includes(format);
  };
  const commonOutput = {
    sourcemap: true,
    banner,
  };
  const base = {
    input: './src/index.ts',
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
  };
  return [
    (buildFormat('esm') || buildFormat('cjs')) && {
      ...base,
      output: [
        buildFormat('esm') && {
          ...commonOutput,
          file: pkg.module,
          format: 'esm',
        },
        buildFormat('esm') && {
          ...commonOutput,
          file: pkg.main,
          format: 'cjs',
        },
      ].filter(Boolean),
    },
    buildFormat('umd') && {
      ...base,
      output: {
        ...commonOutput,
        file: pkg.unpkg,
        format: 'umd',
        name: pkg.global,
        plugins: [terser()],
      },
      external: Object.keys(pkg.peerDependencies || {}),
    },
    buildFormat('types') && {
      ...base,
      output: {
        ...commonOutput,
        file: pkg.types,
        format: 'es',
      },
      plugins: [
        dts({
          respectExternal: true,
        }),
      ],
    },
  ].filter(Boolean);
};
