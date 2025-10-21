import { assert } from 'chai';
import { createStubInstance, restore } from 'sinon';
import SequencesBuilder from './SequencesBuilder.js';
import SequenceBuilder from './SequenceBuilder.js';

describe('Test SequencesBuilder', function () {
    let sequenceBuilderStub;
    beforeEach(() => {
        sequenceBuilderStub = createStubInstance(SequenceBuilder);
    });
    afterEach(() => {
        restore();
    });
    it('build full sequence data with two sequences', function () {
        sequenceBuilderStub.build.withArgs([], "intro").returns({ "data": "intro" });
        sequenceBuilderStub.build.withArgs([], "outro").returns({ "data": "outro" });

        const sequencesBuilder = new SequencesBuilder(sequenceBuilderStub);

        const expected = [
            {
                "data": "intro",
            },
            {
                "data": "outro"
            }
        ];
        const sequences = {
            "intro": {
                slides: []
            },
            "outro": {
                slides: []
            }
        };
        const result = sequencesBuilder.build(sequences);
        assert.deepEqual(expected, result);
    });
});
