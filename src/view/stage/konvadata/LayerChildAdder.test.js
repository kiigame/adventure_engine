import { assert } from 'chai';
import LayerChildAdder from './LayerChildAdder.js';

describe('Test stage LayerChildAdder', function(){
    it('should add children to the specified layer', function(){
        const layerChildAdder = new LayerChildAdder();

        const expected = {
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
        const imagesJson = {
            'children': [
                {
                    "attrs": {
                        "id": 'first'
                    },
                    "children": []
                }
            ]
        };
        const newJson = [
            {
                "id": 'item1'
            },
            {
                "id": 'item2'
            }
        ];
        const result = layerChildAdder.add(imagesJson, newJson, 'first');
        assert.deepEqual(expected, result);
    });

    // TODO: Test case where layer is not found in imagesJson
});
