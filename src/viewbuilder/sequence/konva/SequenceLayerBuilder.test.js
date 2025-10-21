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
        const sequences = {
            "intro": {
                slides: []
            },
            "outro": {
                slides: []
            }
        };
        const layerStub = createStubInstance(Layer);
        konvaObjectLayerPusherStub.execute.returns(layerStub);
        const sequenceLayerBuilder = new SequenceLayerBuilder(
            sequenceBuilderStub,
            konvaObjectLayerPusherStub,
            sequences,
            layerStub
        );

        const expected = [
            {
                "data": "intro",
            },
            {
                "data": "outro"
            }
        ];
        const result = sequenceLayerBuilder.build();
        expect(konvaObjectLayerPusherStub.execute).to.be.calledWith(expected, layerStub);
        expect(result).to.be.equal(layerStub);
    });
});
