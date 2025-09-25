import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import pkg from './package.json' with { type: "json" };

export const build = [
    {
        input: 'src/kiigame.js',
        output: {
            name: 'kiigame',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            resolve(),
            commonjs()
        ]
    },
    {
        input: 'src/kiigame.js',
        external: ['konva'],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ]
    }
];

export const dev = {
    input: 'src/latkazombit.js',
    output: {
        name: 'kiigame',
        file: 'public/src/latkazombit.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        copy({
            targets: [
                { src: 'index.html', dest: 'public/' },
                { src: 'data/*.json', dest: 'public/data/' },
                { src: 'data/audio/**/*', dest: 'public/data/audio/' },
                { src: 'data/images/**/*', dest: 'public/data/images/' },
                { src: 'src/**/*', dest: 'public/src/'},
            ]
        })
    ]
}

export default cli => {
  if (cli.configBuild === true) {
    return build;
  }
  return dev;
}

