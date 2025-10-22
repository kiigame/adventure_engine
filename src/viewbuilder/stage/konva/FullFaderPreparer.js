import StageObjectGetter from "../../../util/konva/StageObjectGetter.js";
import ImagePreparer from "../../util/konva/ImagePreparer.js";

class FullFaderPreparer {
    /**
     * @param {StageObjectGetter} stageObjectGetter
     * @param {ImagePreparer} imagePreparer
     */
    constructor(stageObjectGetter, imagePreparer) {
        this.stageObjectGetter = stageObjectGetter;
        this.imagePreparer = imagePreparer;
    }

    /**
     * @param {int} width
     * @param {int} height
     */
    prepare(width, height) {
        const faderFull = this.stageObjectGetter.getObject('fader_full');
        this.imagePreparer.prepareImages(faderFull);
        // Scale full screen fader
        this.stageObjectGetter.getObject('black_screen_full').size({ width, height });
    }
}

export default FullFaderPreparer;
