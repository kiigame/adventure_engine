import { assert } from 'chai';
import ItemBuilder from './ItemBuilder.js';

describe('Test ItemBuilder', function(){
    it('build item from data', function(){
        const itemBuilder = new ItemBuilder();

        const expected = {
            "attrs": {
                "category": "mock-category",
                "id": "item1",
                "src": "images/item1.png",
                "visible": false,
                "draggable": true,
                "animated": false,
            },
            "className": "Image"
        };
        const itemData = {
            "category": "mock-category",
            "src": "images/item1.png"
        };
        const result = itemBuilder.build(itemData, "item1");
        assert.deepEqual(expected, result);
    });
});
