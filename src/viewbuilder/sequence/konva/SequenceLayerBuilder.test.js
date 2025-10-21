import { expect, use } from 'chai';
import { createStubInstance, restore } from 'sinon';
import sinonChai from "sinon-chai";
import SequenceLayerBuilder from './SequenceLayerBuilder.js';
import SequenceBuilder from './SequenceBuilder.js';
import KonvaObjectLayerPusher from '../../util/konva/KonvaObjectLayerPusher.js';
import pkg from 'konva';
const { Layer } = pkg;
use(sinonChai);

describe('Test SequencesBuilder', function () {
    let sequenceBuilderStub;
    let konvaObjectLayerPusherStub;
    beforeEach(() => {
        sequenceBuilderStub = createStubInstance(SequenceBuilder);
        konvaObjectLayerPusherStub = createStubInstance(KonvaObjectLayerPusher);
    });
    afterEach(() => {
        restore();
    });
    it('build full sequence data with two sequences', function () {
        sequenceBuilderStub.build.withArgs([], "intro").returns({ "data": "intro" });
        sequenceBuilderStub.build.withArgs([], "outro").returns({ "data": "outro" });
        const layerStub = createStubInstance(Layer);

        const sequenceLayerBuilder = new SequenceLayerBuilder(sequenceBuilderStub, konvaObjectLayerPusherStub);

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
        konvaObjectLayerPusherStub.execute.returns(layerStub);
        const result = sequenceLayerBuilder.build(sequences, layerStub);
        expect(konvaObjectLayerPusherStub.execute).to.be.calledWith(expected, layerStub);
        expect(result).to.be.equal(layerStub);
    });
});
