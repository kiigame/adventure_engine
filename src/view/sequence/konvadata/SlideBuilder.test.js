import { assert } from 'chai';
import sinon from 'sinon';
import SlideBuilder from './SlideBuilder.js';
import TextBuilder from './TextBuilder.js';

const textBuilderStub = sinon.createStubInstance(TextBuilder);
textBuilderStub.build.returns(
    {
        "text": "text"
    }
);

describe('Test sequence SlideBuilder', function(){
    it('from only text, build text and rect wrapped in group', function(){
        const slideBuilder = new SlideBuilder(textBuilderStub);

        const expected = {
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
        const slide = {
            "do_fade": true,
            "id": "intro_1",
            "show_time": 4000,
            "text": {
                "text": "Oli nätti päivä, piti olla ihan normaalit treenit.."
            }
        };
        const result = slideBuilder.build(slide);
        assert.deepEqual(expected, result);
    }),
    it('from only imageSrc, it should build an image', function(){
        const slideBuilder = new SlideBuilder(textBuilderStub);

        const expected = {
            "attrs": {
                "category": "sequence",
                "id": "intro_2",
                "src": "images/intro_2.png",
                "visible": false
            },
            "className": "Image"
        };
        const slide = {
            "do_fade": true,
            "id": "intro_2",
            "show_time": 5000,
            "imageSrc": "images/intro_2.png"
        };
        const result = slideBuilder.build(slide);
        assert.deepEqual(expected, result);
    }),
    it('from text and image, build text and image wrapped in group', function(){
        const slideBuilder = new SlideBuilder(textBuilderStub);

        const expected = {
            "attrs": {
                "category": "sequence",
                "id": "intro_42",
                "height": 643,
                "width": 981,
                "visible": false
            },
            "children": [
                {
                    "attrs": {
                        "src": "images/intro_42.png"
                    },
                    "className": "Image"
                },
                {
                    "text": "text"
                }
            ],
            "className": "Group"
        };
        const slide = {
            "do_fade": true,
            "id": "intro_42",
            "show_time": 4000,
            "imageSrc": "images/intro_42.png",
            "text": {
                "text": "Oli nätti päivä, piti olla ihan normaalit treenit.."
            }
        };
        const result = slideBuilder.build(slide);
        assert.deepEqual(expected, result);
    }),
    it('from no text or imageSrc, it should build a rect', function(){
        const slideBuilder = new SlideBuilder(textBuilderStub);

        const expected = {
            "attrs": {
                "category": "sequence",
                "id": "intro_7",
                "visible": false,
                "x": 0,
                "y": 0,
                "fill": "black",
                "height": 643,
                "width": 981
            },
            "className": "Rect"
        };
        const slide = {
            "do_fade": false,
            "id": "intro_7",
            "show_time": 1000
        };
        const result = slideBuilder.build(slide);
        assert.deepEqual(expected, result);
    });
});
