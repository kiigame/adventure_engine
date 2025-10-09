import { assert } from 'chai';
import TextBuilder from './TextBuilder.js';

describe('Test sequence TextBuilder', function(){
    it('it should build expected JSON object with Text data', function(){
        let textBuilder = new TextBuilder();

        const expected = {
            "attrs": {
                "text": "Kaikki ei kuitenkaan ollut niin kuin piti..",
                "fontFamily": "Chalkboard SE",
                "fontSize": 26,
                "fill": "white",
                "shadowColor": "#bbbbbb",
                "shadowBlur": 10,
                "width": 981,
                "align": "center",
                "y": 321
            },
            "className": "Text"
        };
        const text = {
            "text": "Kaikki ei kuitenkaan ollut niin kuin piti.."
        };
        const result = textBuilder.build(text);
        assert.deepEqual(expected, result);
    });
});
