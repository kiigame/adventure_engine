import SequenceBuilder from "./SequenceBuilder.js";
import KonvaObjectLayerPusher from "../../util/konva/KonvaObjectLayerPusher.js";

class SequenceLayerBuilder {
    /**
     * @param {SequenceBuilder} sequenceBuilder
     * @param {KonvaObjectLayerPusher} konvaObjectLayerPusher
     * @param {object} sequences_json A json object containing data to build Konva sequences from
     * @param {Konva.Layer} sequenceLayer reference to the sequence layer
     */
    constructor(sequenceBuilder, konvaObjectLayerPusher, sequences_json, sequenceLayer) {
        this.sequenceBuilder = sequenceBuilder;
        this.konvaObjectLayerPusher = konvaObjectLayerPusher;
        this.sequencesJson = sequences_json;
        this.sequenceLayer = sequenceLayer;
    }

    /**
     * @returns {Konva.Layer} reference to the layer built
     */
    build() {
        const builtSequences = this.buildSequences();
        return this.konvaObjectLayerPusher.execute(builtSequences, this.sequenceLayer);
    }

    buildSequences() {
        const builtSequences = [];
        for (const key in this.sequencesJson) {
            builtSequences.push(
                this.sequenceBuilder.build(
                    this.sequencesJson[key].slides, key
                )
            );
        }
        return builtSequences;
    }
}

export default SequenceLayerBuilder;
