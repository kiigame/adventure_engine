import StageObjectGetter from "../../../util/konva/StageObjectGetter.js";
import ImagePreparer from "../../util/konva/ImagePreparer.js";

class FullFaderPreparer {
    /**
     * @param {Konva.Layer} fullScreenLayer
     * @param {ImagePreparer} imagePreparer
     */
    constructor(fullScreenLayer, imagePreparer) {
        this.fullScreenLayer = fullScreenLayer;
        this.imagePreparer = imagePreparer;
    }

    /**
     * @param {int} width
     * @param {int} height
     */
    prepare(width, height) {
        this.imagePreparer.prepareImages(this.fullScreenLayer);
        // Prepare the full screen fader
        const fadeShape = this.fullScreenLayer.find('#black_screen_full');
        // Scale
        fadeShape.size({ width, height });
        // Stop blocking clicks through the fader (.hide() in FullFadeView should do this, but seems inconsistent)
        fadeShape.listening(false);
        fadeShape.drawHit();
    }
}

export default FullFaderPreparer;
