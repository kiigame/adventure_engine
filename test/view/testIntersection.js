import chai from 'chai';
import sinon from 'sinon';
import Intersection from '../../view/Intersection.js';
import VisibilityValidator from '../../view/intersection/VisibilityValidator.js';

var assert = chai.assert;

var validatorStub = sinon.createStubInstance(VisibilityValidator);

describe('Test Intersection', function() {
    it('will not return true if validator returns false', function() {
        validatorStub.validate.returns(false);
        let intersection = new Intersection([validatorStub]);
        // TODO mock with sinon
        function ShapeStub() {};
        var targetStub = new ShapeStub();
        var draggedStub = new ShapeStub();
        var result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, false);
    });
    it('will return false if the items do not overlap at all', function() {
        validatorStub.validate.returns(true);
        let intersection = new Intersection([validatorStub]);
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
        var result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, false);
    });
    it('will return true if the items fully overlap', function() {
        validatorStub.validate.returns(true);
        let intersection = new Intersection([validatorStub]);
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
        var result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    it('will return true without validators (empty array) and if the items fully overlap', function() {
        let intersection = new Intersection([]);
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
        var result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    it('will return true without validators (null) and if the items fully overlap', function() {
        let intersection = new Intersection();
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
        var result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    // TODO: More test cases
});
