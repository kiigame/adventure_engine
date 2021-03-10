/**
 */
class CategoryValidator {
    constructor(categoriesToInvalidate) {
        this.categoryToInvalidate = categoriesToInvalidate;
    }

    validate(target) {
        var targetCategory = target.getAttr('category');
        if (targetCategory === undefined) {
            return false;
        }
        for (let excludedCategory of this.categoryToInvalidate) {
            if (targetCategory === excludedCategory) {
                return false;
            }
        }
        return true;
    }
}

export default CategoryValidator;
