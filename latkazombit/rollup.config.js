import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export const dev = {
    input: 'src/latkazombit.ts',
    output: {
        name: 'latkazombit',
        file: 'public/src/latkazombit.js',
        format: 'iife',
        sourcemap: true,
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: true,
            module: 'esnext',
            exclude: ["**/*.test.js"]
        }),
        resolve({
            extensions: ['.ts', '.js']
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
    return dev;
}
