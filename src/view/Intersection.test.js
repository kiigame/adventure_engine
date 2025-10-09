import { assert } from 'chai';
import sinon from 'sinon';
import Intersection from './Intersection.js';
import VisibilityValidator from './intersection/VisibilityValidator.js';

const validatorStub = sinon.createStubInstance(VisibilityValidator);

describe('Test Intersection', function() {
    it('will not return true if validator returns false', function() {
        // TODO mock with sinon
        function ShapeStub() {};
        const targetStub = new ShapeStub();
        const draggedStub = new ShapeStub();
        validatorStub.validate.returns(false);
        const intersection = new Intersection([validatorStub]);
        // TODO: Expect validatorStub.validate to be called with targetStub
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, false);
    });
    it('will return false if the items do not overlap at all', function() {
        // TODO mock with sinon
        function ShapeStub(x, y, height, width) {
            this.x = function() {
                return x;
            }
            this.y = function() {
                return y;
            }
            this.width = function() {
                return width;
            }
            this.height = function() {
                return height;
            }
        };
        const targetStub = new ShapeStub(100, 100, 100, 100);
        const draggedStub = new ShapeStub(10, 10, 50, 50);
        validatorStub.validate.returns(true);
        const intersection = new Intersection([validatorStub]);
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, false);
    });
    it('will return true if the items fully overlap', function() {
        // TODO mock with sinon
        function ShapeStub(x, y, height, width) {
            this.x = function() {
                return x;
            }
            this.y = function() {
                return y;
            }
            this.width = function() {
                return width;
            }
            this.height = function() {
                return height;
            }
        };
        const targetStub = new ShapeStub(10, 10, 100, 100);
        const draggedStub = new ShapeStub(11, 11, 50, 50);
        validatorStub.validate.returns(true);
        const intersection = new Intersection([validatorStub]);
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    it('will return true without validators (empty array) and if the items fully overlap', function() {
        // TODO mock with sinon
        function ShapeStub(x, y, height, width) {
            this.x = function() {
                return x;
            }
            this.y = function() {
                return y;
            }
            this.width = function() {
                return width;
            }
            this.height = function() {
                return height;
            }
        };
        const targetStub = new ShapeStub(10, 10, 100, 100);
        const draggedStub = new ShapeStub(11, 11, 50, 50);
        const intersection = new Intersection([]);
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    it('will return true without validators (null) and if the items fully overlap', function() {
        // TODO mock with sinon
        function ShapeStub(x, y, height, width) {
            this.x = function() {
                return x;
            }
            this.y = function() {
                return y;
            }
            this.width = function() {
                return width;
            }
            this.height = function() {
                return height;
            }
        };
        const targetStub = new ShapeStub(10, 10, 100, 100);
        const draggedStub = new ShapeStub(11, 11, 50, 50);
        const intersection = new Intersection();
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    // TODO: More test cases
});
