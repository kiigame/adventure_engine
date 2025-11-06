import Konva from 'konva';

export class CategoryValidator {
    private categoryToInvalidate: string[];

    /**
     * @param {string[]} categoriesToInvalidate
     */
    constructor(categoriesToInvalidate: string[]) {
        this.categoryToInvalidate = categoriesToInvalidate;
    }

    /**
     * @param {Konva.Shape} target
     * @returns {boolean}
     */
    validate(target: Konva.Shape): boolean {
        const targetCategory: string = target.getAttr('category');
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
