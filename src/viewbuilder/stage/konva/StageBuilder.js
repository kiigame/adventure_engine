import SequenceLayerBuilder from "../../sequence/konva/SequenceLayerBuilder.js";
import FullFaderPreparer from "./FullFaderPreparer.js";
import ImagePreparer from "./ImagePreparer.js";

class StageBuilder {
    /**
     * @param {Konva.Stage} stage
     * @param {FullFaderPreparer} fullFaderPerparer
     * @param {SequenceLayerBuilder} sequenceLayerBuilder
     * @param {ImagePreparer} imagePreparer
     */
    constructor(stage, fullFaderPerparer, sequenceLayerBuilder, imagePreparer) {
        this.stage = stage;
        this.fullFaderPreparer = fullFaderPerparer;
        this.sequenceLayerBuilder = sequenceLayerBuilder;
        this.imagePreparer = imagePreparer;
    }

    build() {
        this.fullFaderPreparer.prepare(this.stage.width(), this.stage.height());
        const sequenceLayer = this.sequenceLayerBuilder.build();
        for (const child of sequenceLayer.toObject().children) {
            this.imagePreparer.prepareImages(child);
        }
    }
}

export default StageBuilder;
