import { IntersectionValidator } from "./IntesrsectionValidator";
import Konva from 'konva';

export class Intersection {
    private validators: IntersectionValidator[];

    constructor(validators: IntersectionValidator[]) {
        this.validators = validators;
    }

    check(draggedItem: Konva.Shape, target: Konva.Shape): boolean {
        for (const validator of this.validators) {
            if (!validator.validate(target)) {
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
