import Konva from 'konva';

export interface IntersectionValidator {
    validate(target: Konva.Shape): boolean;
}
