import chai from 'chai';
import CategoryValidator from '../../../view/intersection/CategoryValidator.js';

var assert = chai.assert;

describe('Test CategoryValidator', function() {
    it('will return false if target has excluded category', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName === 'category') {
                    return 'excludedCategory';
                }
            }
        };
        var targetStub = new ShapeStub();
        let categoryValidator = new CategoryValidator(['excludedCategory']);
        var result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
    it('will return false if target has excluded category (multiple excluded categories)', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName === 'category') {
                    return 'anotherExcludedCategory';
                }
            }
        };
        var targetStub = new ShapeStub();
        let categoryValidator = new CategoryValidator(['excludedCategory', 'anotherExcludedCategory']);
        var result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
    it('will return true if target has no excluded category', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName === 'category') {
                    return 'includedCategory';
                }
            }
        };
        var targetStub = new ShapeStub();
        let categoryValidator = new CategoryValidator(['excludedCategory']);
        var result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
    it('will return false if target category is undefined', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName === 'category') {
                    return undefined;
                }
            }
        };
        var targetStub = new ShapeStub();
        let categoryValidator = new CategoryValidator(['excludedCategory']);
        var result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
    it('will return true if no excluded categories are set (null) and category is defined', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName === 'category') {
                    return 'includedCategory';
                }
            }
        };
        var targetStub = new ShapeStub();
        let categoryValidator = new CategoryValidator();
        var result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
    it('will return true if no excluded categories are set (empty array) and category is defined', function() {
        // TODO: Stub with sinon
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName === 'category') {
                    return 'includedCategory';
                }
            }
        };
        var targetStub = new ShapeStub();
        let categoryValidator = new CategoryValidator([]);
        var result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
});