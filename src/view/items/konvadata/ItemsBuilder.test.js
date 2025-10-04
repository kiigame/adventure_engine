import { assert } from 'chai';
import sinon from 'sinon';
import ItemsBuilder from './ItemsBuilder.js';
import ItemBuilder from './ItemBuilder.js';

const itemBuilderStub = sinon.createStubInstance(ItemBuilder);
itemBuilderStub.build.withArgs({}, "item1").returns({ "data": "sword" });
itemBuilderStub.build.withArgs({}, "item2").returns({ "data": "shield" });

describe('Test ItemsBuilder', function(){
    it('build full items data with two items', function(){
        const itemsBuilder = new ItemsBuilder(itemBuilderStub);

        const expected = [
            {
                "data": "sword"
            },
            {
                "data": "shield"
            }
        ];
        const items_json = {
            "item1": {
                // item data
            },
            "item2": {
                // item data
            }
        };
        const result = itemsBuilder.build(items_json);
        assert.deepEqual(expected, result);
    });
});
