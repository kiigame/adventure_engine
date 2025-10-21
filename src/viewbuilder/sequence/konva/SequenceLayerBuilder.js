import SequenceBuilder from "./SequenceBuilder.js";
import KonvaObjectLayerPusher from "../../util/konva/KonvaObjectLayerPusher.js";

/** */
class SequenceLayerBuilder {

    /**
     * @param {SequenceBuilder} sequenceBuilder
     * @param {KonvaObjectLayerPusher} konvaObjectLayerPusher
     */
    constructor(sequenceBuilder, konvaObjectLayerPusher) {
        this.sequenceBuilder = sequenceBuilder;
        this.konvaObjectLayerPusher = konvaObjectLayerPusher;
    }

    /**
     * @param {object} sequences_json A json object containing data to build Konva sequences from
     * @param {Konva.Layer} sequenceLayer reference to the sequence layer
     * @returns {Konva.Layer} reference to the sequence layer
     */
    build(sequences_json, sequenceLayer) {
        const builtSequences = [];
        for (const key in sequences_json) {
            builtSequences.push(
                this.sequenceBuilder.build(
                    sequences_json[key].slides, key
                )
            );
        }
        return this.konvaObjectLayerPusher.execute(builtSequences, sequenceLayer);
    }
}

export default SequenceLayerBuilder;
