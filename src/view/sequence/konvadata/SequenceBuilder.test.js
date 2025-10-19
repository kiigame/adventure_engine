import { assert } from 'chai';
import { createStubInstance, restore } from 'sinon';
import SequenceBuilder from './SequenceBuilder.js';
import SlideBuilder from './SlideBuilder.js';

describe('Test SequenceBuilder', function () {
    let slideBuilderStub;
    beforeEach(() => {
        slideBuilderStub = createStubInstance(SlideBuilder);
    });
    afterEach(() => {
        restore();
    });
    it('build sequence with two slides', function () {
        // don't test what SlideBuilder really returns, just that it's called correctly
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

        const sequenceBuilder = new SequenceBuilder(slideBuilderStub);

        const expected = {
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
            "className": "Group"
        };
        const slides = [
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
        const result = sequenceBuilder.build(slides, 'intro');
        assert.deepEqual(expected, result);
    });
});
