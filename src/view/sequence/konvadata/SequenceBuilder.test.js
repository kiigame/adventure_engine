import { assert } from 'chai';
import sinon from 'sinon';
import SequenceBuilder from './SequenceBuilder.js';
import SlideBuilder from './SlideBuilder.js';

describe('Test SequenceBuilder', function () {
    it('build sequence with two slides', function () {
        // stubbing - we don't test what SlideBuilder really returns, just that
        // we call it correctly
        var slideBuilderStub = sinon.createStubInstance(SlideBuilder);
        slideBuilderStub.build.withArgs(
            {
                "do_fade": true,
                "id": "intro_1",
                "show_time": 4000,
                "text": {
                    "text": "Oli nätti päivä, piti olla ihan normaalit treenit.."
                }
            }
        ).returns({ "slide": "mock_intro_1" });
        slideBuilderStub.build.withArgs(
            {
                "do_fade": true,
                "id": "intro_2",
                "show_time": 5000,
                "imageSrc": "images/intro_2.png"
            }
        ).returns({ "slide": "mock_intro_2" });

        let sequenceBuilder = new SequenceBuilder(slideBuilderStub);

        var expected = {
            "attrs": {
                "category": "sequence",
                "id": "intro",
                "visible": false
            },
            "children": [
                {
                    "slide": "mock_intro_1"
                },
                {
                    "slide": "mock_intro_2"
                }
            ],
            "className": "Layer"
        };
        var slides = [
            {
                "do_fade": true,
                "id": "intro_1",
                "show_time": 4000,
                "text": {
                    "text": "Oli nätti päivä, piti olla ihan normaalit treenit.."
                }
            },
            {
                "do_fade": true,
                "id": "intro_2",
                "show_time": 5000,
                "imageSrc": "images/intro_2.png"
            }
        ];
        var result = sequenceBuilder.build(slides, 'intro');
        assert.deepEqual(expected, result);
    });
});
