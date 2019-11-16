import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

export const build = [
    {
        input: 'kiigame.js',
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
        input: 'kiigame.js',
        external: ['konva'],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ]
    }
];

export const dev = {
    input: 'latkazombit.js',
    output: {
        name: 'kiigame',
        file: 'public/latkazombit.js',
        format: 'iife',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        copy({
            targets: [
                { src: 'kiigame.html', dest: 'public/' },
                { src: '*.json', dest: 'public/' },
                { src: 'audio/**/*', dest: 'public/audio/' },
                { src: 'images/**/*', dest: 'public/images/' },
                { src: 'util/**/*', dest: 'public/util/' },
                { src: 'view/**/*', dest: 'public/view/' }
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

