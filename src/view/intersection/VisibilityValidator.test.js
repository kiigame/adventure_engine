import { assert } from 'chai';
import { createStubInstance, restore } from 'sinon';
import VisibilityValidator from './VisibilityValidator.js';
import pkg from 'konva';
const { Shape } = pkg;

describe('Test VisibilityValidator', function() {
    afterEach(() => {
        restore();
    });
    it('will return true if target has visibility', function() {
        const targetStub = createStubInstance(Shape, {
            isVisible: true
        });
        const visibilityValidator = new VisibilityValidator();
        const result = visibilityValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
    it ('will return false if target has no visibility', function() {
        const targetStub = createStubInstance(Shape, {
            isVisible: false
        });
        const visibilityValidator = new VisibilityValidator();
        const result = visibilityValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
});