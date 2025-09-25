import { assert } from 'chai';
import LayerChildAdder from './LayerChildAdder.js';

describe('Test stage LayerChildAdder', function(){
    it('should add children to the specified layer', function(){
        let layerChildAdder = new LayerChildAdder();

        var expected = {
            'children': [
                {
                    "attrs": {
                        "id": 'first'
                    },
                    "children": [
                        {
                            "id": 'item1'
                        },
                        {
                            "id": 'item2'
                        }
                    ]
                }
            ]
        };
        var imagesJson = {
            'children': [
                {
                    "attrs": {
                        "id": 'first'
                    },
                    "children": []
                }
            ]
        };
        var newJson = [
            {
                "id": 'item1'
            },
            {
                "id": 'item2'
            }
        ];
        var result = layerChildAdder.add(imagesJson, newJson, 'first');
        assert.deepEqual(expected, result);
    });

    // TODO: Test case where layer is not found in imagesJson
});
