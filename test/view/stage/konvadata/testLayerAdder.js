import { assert } from 'chai';
import LayerAdder from '../../../../view/stage/konvadata/LayerAdder.js';

describe('Test stage LayerAdder', function(){
    it('should splice given object after specified layer', function(){
        let layerAdder = new LayerAdder();

        var expected = {
            'children': [
                {
                    attrs: {
                        id: 'first'
                    }
                },
                {
                    attrs: {
                        id: 'room1'
                    }
                },
                {
                    attrs: {
                        id: 'room2'
                    }
                },
                {
                    attrs: {
                        id: 'fader_room'
                    }
                },
                {
                    attrs: {
                        id: 'last'
                    }
                }
            ]
        };
        var imagesJson = {
            'children': [
                {
                    attrs: {
                        id: 'first'
                    }
                },
                {
                    attrs: {
                        id: 'fader_room'
                    }
                },
                {
                    attrs: {
                        id: 'last'
                    }
                }
            ]
        };
        var newJson = [
            {
                attrs: {
                    id: 'room1'
                }
            },
            {
                attrs: {
                    id: 'room2'
                }
            }
        ];
        var beforeLayer = 'fader_room';
        var result = layerAdder.process(imagesJson, newJson, beforeLayer);
        assert.deepEqual(expected, result);
    });

    // TODO: Test case where beforeLayer is not given (i.e. the new stuff can go last)
    // TODO: Test case where beforeLayer is not found in imagesJson
});
