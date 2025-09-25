import { assert } from 'chai';
import sinon from 'sinon';
import SequencesBuilder from './SequencesBuilder.js';
import SequenceBuilder from './SequenceBuilder.js';

var sequenceBuilderStub = sinon.createStubInstance(SequenceBuilder);
sequenceBuilderStub.build.withArgs([], "intro").returns({ "data": "intro"});
sequenceBuilderStub.build.withArgs([], "outro").returns({ "data": "outro"});

describe('Test SequencesBuilder', function(){
    it('build full sequence data with two sequences', function(){
        let sequencesBuilder = new SequencesBuilder(sequenceBuilderStub);

        var expected = [
            {
                "data": "intro",
            },
            {
                "data": "outro"
            }
        ];
        var sequences = {
            "intro": {
                slides: []
            },
            "outro": {
                slides: []
            }
        };
        var result = sequencesBuilder.build(sequences);
        assert.deepEqual(expected, result);
    });
});
