import { assert } from 'chai';
import { createStubInstance, restore, stub } from 'sinon';
import { HitRegionFilter } from './HitRegionFilter.js';
import pkg from 'konva';
const { Shape } = pkg;

describe('Test filtering for hit regions for Konva shapes', function() {
    afterEach(() => {
        restore();
    });
    it('Lätkäzombit secret should not have a hit region', function() {
        const hitRegionFilter = new HitRegionFilter(['secret'], ['Image']);
        const shapeStub = createStubInstance(Shape, {
            getAttr: stub().withArgs('category').returns('secret')
        });
        shapeStub.className = 'Image';

        const result = hitRegionFilter.filter(shapeStub);
        assert.deepEqual(result, false);
    });
    it('Default non-Image Shape should not have a hit region', function() {
        const hitRegionFilter = new HitRegionFilter([], ['Image']);
        const shapeStub = createStubInstance(Shape, {
            getAttr: stub().withArgs('category').returns('furniture')
        });
        shapeStub.className = 'SomethingElse';

        const result = hitRegionFilter.filter(shapeStub);
        assert.deepEqual(result, false);
    });
    it('Non-excluded Image should have a hit region', function() {
        const hitRegionFilter = new HitRegionFilter(['someExcludedCategory'], ['Image']);
        const shapeStub = createStubInstance(Shape, {
            getAttr: stub().withArgs('category').returns('furniture')
        });
        shapeStub.className = 'Image';

        const result = hitRegionFilter.filter(shapeStub);
        assert.deepEqual(result, true);
    });
});
