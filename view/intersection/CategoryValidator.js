/**
 */
class CategoryValidator {
    constructor(categoriesToInvalidate) {
        if (categoriesToInvalidate === null || categoriesToInvalidate === undefined) {
            categoriesToInvalidate = [];
        }
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
