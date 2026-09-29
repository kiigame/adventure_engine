import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export const build = [
  {
    input: [
      'src/index.ts',
      'src/inversify.config.ts',
      'src/events/EventEmitter.ts'
    ],
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
    },
    external: ['inversify'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        module: 'esnext',
        outDir: 'dist'
      }),
      resolve({
        extensions: ['.ts']
      }),
      commonjs({ extensions: ['.ts'] }),
    ]
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default cli => {
  return build;
}
