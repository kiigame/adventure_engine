import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

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
        })
    ]
}

export default cli => {
    return dev;
}
