import { assert } from 'chai';
import { createStubInstance, stub, restore } from 'sinon';
import { CategoryValidator } from './CategoryValidator.js';
import pkg from 'konva';
const { Shape } = pkg;

describe('Test CategoryValidator', function() {
    afterEach(() => {
        restore();
    });
    it('will return false if target has excluded category', function() {
        const targetStub = createStubInstance(Shape, {
            getAttr: stub().withArgs('category').returns('excludedCategory')
        });
        const categoryValidator = new CategoryValidator(['excludedCategory']);
        const result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
    it('will return false if target has excluded category (multiple excluded categories)', function() {
        const targetStub = createStubInstance(Shape, {
            getAttr: stub().withArgs('category').returns('anotherExcludedCategory')
        });
        const categoryValidator = new CategoryValidator(['excludedCategory', 'anotherExcludedCategory']);
        const result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
    it('will return true if target has no excluded category', function() {
        const targetStub = createStubInstance(Shape, {
            getAttr: stub().withArgs('category').returns('includedCategory')
        });
        const categoryValidator = new CategoryValidator(['excludedCategory']);
        const result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
    it('will return false if target category is undefined', function() {
        const targetStub = createStubInstance(Shape, {
            getAttr: stub().withArgs('category').returns(undefined)
        });
        const categoryValidator = new CategoryValidator(['excludedCategory']);
        const result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, false);
    });
    it('will return true if no excluded categories are set (empty array) and category is defined', function() {
        const targetStub = createStubInstance(Shape, {
            getAttr: stub().withArgs('category').returns('includedCategory')
        });
        const categoryValidator = new CategoryValidator([]);
        const result = categoryValidator.validate(targetStub);
        assert.deepEqual(result, true);
    });
});
