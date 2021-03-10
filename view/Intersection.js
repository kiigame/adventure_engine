/**
 */
class Intersection {
    constructor(validators) {
        if (validators === null || validators === undefined) {
            validators = [];
        }
        this.validators = validators;
    }

    check(draggedItem, target) {
        for (let validator of this.validators) {
            if (!validator.validate()) {
                return false;
            }
        }

        // If horizontally inside
        if (draggedItem.x() > target.x()
            && draggedItem.x() < (target.x() + target.width()) || (draggedItem.x() + draggedItem.width()) > target.x()
            && (draggedItem.x() + draggedItem.width()) < (target.x() + target.width())
        ) {
            // If vertically inside
            if (draggedItem.y() > target.y()
                && draggedItem.y() < (target.y() + target.height()) || (draggedItem.y() + draggedItem.height()) > target.y()
                && (draggedItem.y() + draggedItem.height()) < (target.y() + target.height())
            ) {
                return true;
            }
        }

        return false;
    }
}

export default Intersection;
