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
        var targetStub = new ShapeStub();
        let visibilityValidator = new VisibilityValidator();
        var result = visibilityValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
    it ('will return false if target has no visibility', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.isVisible = function () {
                return false;
            }
        };
        var targetStub = new ShapeStub();
        let visibilityValidator = new VisibilityValidator();
        var result = visibilityValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
});