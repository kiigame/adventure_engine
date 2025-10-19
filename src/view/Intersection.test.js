import { assert, expect } from 'chai';
import { createStubInstance, restore } from 'sinon';
import Intersection from './Intersection.js';
import VisibilityValidator from './intersection/VisibilityValidator.js';
import pkg from 'konva';
const { Shape } = pkg;

describe('Test Intersection', function() {
    let validatorStub;
    beforeEach(() => {
        validatorStub = createStubInstance(VisibilityValidator);
    });
    afterEach(() => {
        restore();
    });
    it('will not return true if validator returns false', function() {
        const targetStub = createStubInstance(Shape);
        const draggedStub = createStubInstance(Shape);
        validatorStub.validate.returns(false);
        const intersection = new Intersection([validatorStub]);
        const result = intersection.check(draggedStub, targetStub);
        expect(validatorStub.validate).to.have.been.calledWith(targetStub);
        assert.deepEqual(result, false);
    });
    it('will return false if the items do not overlap at all', function() {
        const targetStub = createStubInstance(Shape, { x: 100, y: 100, width: 100, height: 100 });
        const draggedStub = createStubInstance(Shape, { x: 10, y: 10, width: 50, height: 50 });
        validatorStub.validate.returns(true);
        const intersection = new Intersection([validatorStub]);
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, false);
    });
    it('will return true if the items fully overlap', function() {
        const targetStub = createStubInstance(Shape, { x: 10, y: 10, width: 100, height: 100 });
        const draggedStub = createStubInstance(Shape, { x: 11, y: 11, width: 50, height: 50 });
        validatorStub.validate.returns(true);
        const intersection = new Intersection([validatorStub]);
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    it('will return true without validators (empty array) and if the items fully overlap', function() {
        const targetStub = createStubInstance(Shape, { x: 10, y: 10, width: 100, height: 100 });
        const draggedStub = createStubInstance(Shape, { x: 11, y: 11, width: 50, height: 50 });
        const intersection = new Intersection([]);
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    it('will return true without validators (null) and if the items fully overlap', function() {
        const targetStub = createStubInstance(Shape, { x: 10, y: 10, width: 100, height: 100 });
        const draggedStub = createStubInstance(Shape, { x: 11, y: 11, width: 50, height: 50 });
        const intersection = new Intersection();
        const result = intersection.check(draggedStub, targetStub);
        assert.deepEqual(result, true);
    });
    // TODO: More test cases
});
