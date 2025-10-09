import { assert } from 'chai';
import CategoryValidator from './CategoryValidator.js';

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
        const targetStub = new ShapeStub();
        const categoryValidator = new CategoryValidator(['excludedCategory']);
        const result = categoryValidator.validate(targetStub);
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
        const targetStub = new ShapeStub();
        const categoryValidator = new CategoryValidator(['excludedCategory', 'anotherExcludedCategory']);
        const result = categoryValidator.validate(targetStub);
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
        const targetStub = new ShapeStub();
        const categoryValidator = new CategoryValidator(['excludedCategory']);
        const result = categoryValidator.validate(targetStub);
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
        const targetStub = new ShapeStub();
        const categoryValidator = new CategoryValidator(['excludedCategory']);
        const result = categoryValidator.validate(targetStub);
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
        const targetStub = new ShapeStub();
        const categoryValidator = new CategoryValidator();
        const result = categoryValidator.validate(targetStub);
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
        const targetStub = new ShapeStub();
        const categoryValidator = new CategoryValidator([]);
        const result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
});