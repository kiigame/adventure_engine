var chai = require('chai');
var sinon = require('sinon');
var assert = chai.assert;
SlideBuilder = require('../../../view/sequence/SlideBuilder.js');
TextBuilder = require('../../../view/sequence/TextBuilder.js');

describe('Test sequence SlideBuilder', function(){
    it('it should build text and rect wrapped in group', function(){
        textBuilderStub = sinon.createStubInstance(TextBuilder);
        textBuilderStub.build.returns(
            {
                "text": "text"
            }
        );

        let slideBuilder = new SlideBuilder(textBuilderStub);

        var expected = {
            "attrs": {
                "category": "sequence",
                "id": "intro_1",
                "height": 643,
                "width": 981,
                "visible": false
            },
            "children": [
                {
                    "attrs": {
                        "x": 0,
                        "y": 0,
                        "fill": "black",
                        "height": 643,
                        "width": 981
                    },
                    "className": "Rect"
                },
                {
                    "text": "text"
                }
            ],
            "className": "Group"
        };
        var slide = {
            "do_fade": true,
            "id": "intro_1",
            "show_time": 4000,
            "text": {
                "text": "Oli nätti päivä, piti olla ihan normaalit treenit.."
            }
        };
        var result = slideBuilder.build(slide, "intro_1");
        assert.deepEqual(expected, result);
    });
});