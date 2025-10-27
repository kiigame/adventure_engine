/**
 * Filter shapes that should have a hit region by adventure object category and shape class name.
 */
class HitRegionFilter {
    constructor(categoriesToExclude, shapeClassesToInclude) {
        this.categoriesToExclude = categoriesToExclude;
        this.shapeClassesToInclude = shapeClassesToInclude;
    }

    filter(shape)
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

export default HitRegionFilter;
