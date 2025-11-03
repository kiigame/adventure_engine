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
            format: 'umd',
            globals: {
                konva: 'Konva',
                inversify: 'inversify',
                'reflect-metadata': 'Reflect'
            }
        },
        plugins: [
            resolve({
                extensions: ['.js', '.ts']
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.build.json',
                outputToFilesystem: true
            }),
        ]
    },
    {
        input: 'src/kiigame.js',
        external: ['konva', 'reflect-metadata', 'inversify'],
        output: [
            {
                file: pkg.module,
                format: 'es',
                sourcemap: true
            },
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true
            }
        ],
        plugins: [
            resolve({
                extensions: ['.ts', '.js']
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.build.json',
                outputToFilesystem: true
            }),
        ]
    },
];

export const dev = {
    input: 'src/latkazombit.ts',
    output: {
        name: 'kiigame',
        file: 'public/src/latkazombit.js',
        format: 'iife',
        sourcemap: true,
    },
    plugins: [
        resolve({
            extensions: ['.js', '.ts']
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.build-dev.json',
            sourceMap: true,
            module: 'esnext'
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
