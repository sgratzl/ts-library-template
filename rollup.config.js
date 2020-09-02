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

const isDependency = (v) => Object.keys(pkg.dependencies || {}).some((e) => e === v || v.startsWith(e + '/'));
const isPeerDependency = (v) => Object.keys(pkg.peerDependencies || {}).some((e) => e === v || v.startsWith(e + '/'));

export default (options) => {
  const buildFormat = (format) => {
    return !options.watch || watchOnly.includes(format);
  };
  const base = {
    input: './src/index.ts',
    output: {
      sourcemap: true,
      banner,
      globals: {},
    },
    external: (v) => isDependency(v) || isPeerDependency(v),
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
          ...base.output,
          file: pkg.module,
          format: 'esm',
        },
        buildFormat('esm') && {
          ...base.output,
          file: pkg.main,
          format: 'cjs',
        },
      ].filter(Boolean),
    },
    (buildFormat('umd') || buildFormat('umd-min')) && {
      ...base,
      output: [
        buildFormat('umd') && {
          ...base.output,
          file: pkg.unpkg.replace('.min', ''),
          format: 'umd',
          name: pkg.global,
        },
        buildFormat('umd-min') && {
          ...base.output,
          file: pkg.unpkg,
          format: 'umd',
          name: pkg.global,
          plugins: [terser()],
        },
      ].filter(Boolean),
      external: (v) => isPeerDependency(v),
    },
    buildFormat('types') && {
      ...base,
      output: {
        ...base.output,
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
