import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

export const build = [
    {
        input: [
            'src/kiigame.ts',
            'src/util/JSONGetter.ts',
            'src/controller/interactions/DefaultInteractionResolver.ts',
            'src/view/room/HitRegionInitializer.ts',
            'src//view/room/hitregion/HitRegionFilter.ts',
            'src/view/draggeditem/intersection/Intersection.ts',
            'src/view/draggeditem/intersection/VisibilityValidator.ts',
            'src/view/draggeditem/intersection/CategoryValidator.ts',
            'src/viewbuilder/util/konva/ImagePreparer.ts',
            'src/viewbuilder/room/konva/FurnitureBuilder.ts',
            'src/controller/interactions/CommandsHandler.ts',
            'src/controller/interactions/CommandHandler.ts',
            'src/inversify.config.ts',
            'src/events/EventEmitter.ts'
        ],
        output: {
            dir: 'dist',
            format: 'esm',
            sourcemap: true,
        },
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
    {
        input: [
            './dist/types/kiigame.d.ts',
            './dist/types/util/JSONGetter.d.ts',
            './dist/types/controller/interactions/DefaultInteractionResolver.d.ts',
            './dist/types/view/room/HitRegionInitializer.d.ts',
            './dist/types//view/room/hitregion/HitRegionFilter.d.ts',
            './dist/types/view/draggeditem/intersection/Intersection.d.ts',
            './dist/types/view/draggeditem/intersection/VisibilityValidator.d.ts',
            './dist/types/view/draggeditem/intersection/CategoryValidator.d.ts',
            './dist/types/viewbuilder/util/konva/ImagePreparer.d.ts',
            './dist/types/viewbuilder/room/konva/FurnitureBuilder.d.ts',
            './dist/types/controller/interactions/CommandsHandler.d.ts',
            './dist/types/controller/interactions/CommandHandler.d.ts',
            './dist/types/inversify.config.d.ts',
            './dist/types/events/EventEmitter.d.ts'
        ],
        output: [{ dir: 'dist', format: 'es' }],
        plugins: [dts()],
    },
];                                                                                                                                                                                                                                                                                                                                                                                                                                            

export default cli => {
    return build;
}
