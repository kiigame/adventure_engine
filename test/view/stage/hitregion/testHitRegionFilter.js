import chai from 'chai';
import HitRegionFilter from '../../../../view/stage/hitregion/HitRegionFilter.js';

var assert = chai.assert;

describe('Test filtering for hit regions for Konva shapes', function() {
    it('Lätkäzombit secret will should not have a hit region', function() {
        let hitRegionFilter = new HitRegionFilter(['secret'], ['Image']);

        // TODO: Do this with sinon?
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName == 'category') {
                    return 'secret';
                }
            },
            this.className = 'Image';
        };
        var shapeStub = new ShapeStub();

        var result = hitRegionFilter.filter(shapeStub);
        assert.deepEqual(result, false);
    });

    it('Default non-Image Shape should not have a hit region', function() {
        let hitRegionFilter = new HitRegionFilter([], ['Image']);

        // TODO: Do this with sinon?
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName == 'category') {
                    return 'furniture';
                }
            },
            this.className = 'SomethingElse';
        };
        var shapeStub = new ShapeStub();

        var result = hitRegionFilter.filter(shapeStub);
        assert.deepEqual(result, false);
    });

    it('Non-excluded Image should have a hit region', function() {
        let hitRegionFilter = new HitRegionFilter(['someExcludedCategory'], ['Image']);

        // TODO: Do this with sinon?
        function ShapeStub() {
            this.getAttr = function (attrName) {
                if (attrName == 'category') {
                    return 'furniture';
                }
            },
            this.className = 'Image';
        };
        var shapeStub = new ShapeStub();

        var result = hitRegionFilter.filter(shapeStub);
        assert.deepEqual(result, true);
    });
});
