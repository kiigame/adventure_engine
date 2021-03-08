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
        if (shape.getAttr('category') in this.categoriesToExclude) {
            return false;
        }

        if (!shape.className in this.shapeClassesToInclude) {
            return false;
        }

        return true;
    }
}

export default HitRegionFilter;
