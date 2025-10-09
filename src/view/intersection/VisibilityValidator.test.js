import { assert } from 'chai';
import VisibilityValidator from './VisibilityValidator.js';

describe('Test VisibilityValidator', function() {
    it('will return true if target has visibility', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.isVisible = function () {
                return true;
            }
        };
        const targetStub = new ShapeStub();
        const visibilityValidator = new VisibilityValidator();
        const result = visibilityValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
    it ('will return false if target has no visibility', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.isVisible = function () {
                return false;
            }
        };
        const targetStub = new ShapeStub();
        const visibilityValidator = new VisibilityValidator();
        const result = visibilityValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
});