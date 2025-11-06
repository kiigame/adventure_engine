import Konva from 'konva';

export class VisibilityValidator {
    /**
     * @param {Konva.Shape} target
     * @returns {boolean}
     */    
    validate(target: Konva.Shape): boolean {
        return target.isVisible();
    }
}
