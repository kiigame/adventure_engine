import Konva from 'konva';
import { IntersectionValidator } from './IntesrsectionValidator.js';

export class VisibilityValidator implements IntersectionValidator {
    /**
     * @param {Konva.Shape} target
     * @returns {boolean}
     */    
    validate(target: Konva.Shape): boolean {
        return target.isVisible();
    }
}
