import Konva from 'konva';

/**
 * Filter shapes that should have a hit region by adventure object category and shape class name.
 */
export class HitRegionFilter {
    private categoriesToExclude: string[];
    private shapeClassesToInclude: string[];

    constructor(categoriesToExclude: string[], shapeClassesToInclude: string[]) {
        this.categoriesToExclude = categoriesToExclude;
        this.shapeClassesToInclude = shapeClassesToInclude;
    }

    filter(shape: Konva.Shape): boolean
    {
        if (this.categoriesToExclude.includes(shape.getAttr('category'))) {
            return false;
        }

        if (!this.shapeClassesToInclude.includes(shape.className)) {
            return false;
        }

        return true;
    }
}
