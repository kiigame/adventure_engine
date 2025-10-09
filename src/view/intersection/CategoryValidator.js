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
        const targetCategory = target.getAttr('category');
        if (targetCategory === undefined) {
            return false;
        }
        for (const excludedCategory of this.categoryToInvalidate) {
            if (targetCategory === excludedCategory) {
                return false;
            }
        }
        return true;
    }
}

export default CategoryValidator;
