import RoomLayerBuilder from "../../room/konva/RoomLayerBuilder.js";
import SequenceLayerBuilder from "../../sequence/konva/SequenceLayerBuilder.js";
import FullFaderPreparer from "./FullFaderPreparer.js";
import ImagePreparer from "./ImagePreparer.js";

class StageBuilder {
    /**
     * @param {Konva.Stage} stage
     * @param {FullFaderPreparer} fullFaderPerparer
     * @param {SequenceLayerBuilder} sequenceLayerBuilder
     * @param {RoomLayerBuilder} roomLayerBuilder
     * @param {ImagePreparer} imagePreparer
     */
    constructor(stage, fullFaderPerparer, sequenceLayerBuilder, roomLayerBuilder, imagePreparer) {
        this.stage = stage;
        this.fullFaderPreparer = fullFaderPerparer;
        this.sequenceLayerBuilder = sequenceLayerBuilder;
        this.roomLayerBuilder = roomLayerBuilder;
        this.imagePreparer = imagePreparer;
    }

    build() {
        this.fullFaderPreparer.prepare(this.stage.width(), this.stage.height());
        const sequenceLayer = this.sequenceLayerBuilder.build();
        for (const child of sequenceLayer.toObject().children) {
            this.imagePreparer.prepareImages(child);
        }
        this.roomLayerBuilder.build(this.stage.width(), this.stage.height());
    }
}

export default StageBuilder;
