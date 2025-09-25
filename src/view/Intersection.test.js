import { assert } from 'chai';
import sinon from 'sinon';
import Intersection from './Intersection.js';
import VisibilityValidator from './intersection/VisibilityValidator.js';

var validatorStub = sinon.createStubInstance(VisibilityValidator);

describe('Test Intersection', function() {
    it('will not return true if validator returns false', function() {
        // TODO mock with sinon
        function ShapeStub() {};
        var targetStub = new ShapeStub();
        var draggedStub = new ShapeStub();
        validatorStub.validate.returns(false);
        let intersection = new Intersection([validatorStub]);
        // TODO: Expect validatorStub.validate to be called with targetStub
        var result = intersection.check(draggedStub, targetStub);
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
        var targetStub = new ShapeStub(100, 100, 100, 100);
        var draggedStub = new ShapeStub(10, 10, 50, 50);
        validatorStub.validate.returns(true);
        let intersection = new Intersection([validatorStub]);
        var result = intersection.check(draggedStub, targetStub);
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
        var targetStub = new ShapeStub(10, 10, 100, 100);
        var draggedStub = new ShapeStub(11, 11, 50, 50);
        validatorStub.validate.returns(true);
        let intersection = new Intersection([validatorStub]);
        var result = intersection.check(draggedStub, targetStub);
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
        var targetStub = new ShapeStub(10, 10, 100, 100);
        var draggedStub = new ShapeStub(11, 11, 50, 50);
        let intersection = new Intersection([]);
        var result = intersection.check(draggedStub, targetStub);
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
        var targetStub = new ShapeStub(10, 10, 100, 100);
        var draggedStub = new ShapeStub(11, 11, 50, 50);
        let intersection = new Intersection();
        var result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    // TODO: More test cases
});
