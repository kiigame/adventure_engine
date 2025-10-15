import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import pkg from './package.json' with { type: "json" };
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

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
            commonjs(),
            typescript()
        ]
    },
    {
        input: 'src/kiigame.js',
        external: ['konva', 'reflect-metadata', 'inversify'],
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
        sourcemap: true,
//        sourcemapExcludeSources: true
    },
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: true
        }),
        copy({
            targets: [
                { src: 'index.html', dest: 'public/' },
                { src: 'data/*.json', dest: 'public/data/' },
                { src: 'data/audio/**/*', dest: 'public/data/audio/' },
                { src: 'data/images/**/*', dest: 'public/data/images/' },
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
