import { expect, use } from 'chai';
import { createStubInstance, restore } from 'sinon';
import sinonChai from "sinon-chai";
import SequenceLayerBuilder from './SequenceLayerBuilder.js';
import SequenceBuilder from './SequenceBuilder.js';
import KonvaObjectContainerPusher from '../../util/konva/KonvaObjectContainerPusher.js';
import pkg from 'konva';
const { Layer } = pkg;
use(sinonChai);

describe('Test SequencesBuilder', function () {
    let sequenceBuilderStub;
    let konvaObjectContainerPusherStub;
    beforeEach(() => {
        sequenceBuilderStub = createStubInstance(SequenceBuilder);
        konvaObjectContainerPusherStub = createStubInstance(KonvaObjectContainerPusher);
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
        konvaObjectContainerPusherStub.execute.returns(layerStub);
        const sequenceLayerBuilder = new SequenceLayerBuilder(
            sequenceBuilderStub,
            konvaObjectContainerPusherStub,
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
        expect(konvaObjectContainerPusherStub.execute).to.be.calledWith(expected, layerStub);
        expect(result).to.be.equal(layerStub);
    });
});
