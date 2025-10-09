import { assert } from 'chai';
import sinon from 'sinon';
import SequencesBuilder from './SequencesBuilder.js';
import SequenceBuilder from './SequenceBuilder.js';

const sequenceBuilderStub = sinon.createStubInstance(SequenceBuilder);
sequenceBuilderStub.build.withArgs([], "intro").returns({ "data": "intro"});
sequenceBuilderStub.build.withArgs([], "outro").returns({ "data": "outro"});

describe('Test SequencesBuilder', function(){
    it('build full sequence data with two sequences', function(){
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
