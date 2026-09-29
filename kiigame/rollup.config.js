import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export const build = [
    {
        input: [
            'src/kiigame.ts',
            'src/util/JSONGetter.ts',
            'src/controller/interactions/DefaultInteractionResolver.ts',
            'src/view/room/HitRegionInitializer.ts',
            'src/view/room/hitregion/HitRegionFilter.ts',
            'src/view/draggeditem/intersection/Intersection.ts',
            'src/view/draggeditem/intersection/VisibilityValidator.ts',
            'src/view/draggeditem/intersection/CategoryValidator.ts',
            'src/viewbuilder/util/konva/ImagePreparer.ts',
            'src/viewbuilder/room/konva/FurnitureBuilder.ts',
            'src/controller/interactions/CommandsHandler.ts',
            'src/controller/interactions/CommandHandler.ts',
            'src/inversify.config.ts',
        ],
        output: {
            dir: 'dist',
            format: 'esm',
            sourcemap: true,
        },
        external: id => /^@kiigame\/kgae_ts(?:\/|$)/.test(id),
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                sourceMap: true,
                module: 'esnext',
                outDir: 'dist'
            }),
            resolve({
                extensions: ['.js', '.ts']
            }),
            commonjs({ extensions: ['.js', '.ts'] }),
        ]
    },
];                                                                                                                                                                                                                                                                                                                                                                                                                                            

export default cli => {
    return build;
}
