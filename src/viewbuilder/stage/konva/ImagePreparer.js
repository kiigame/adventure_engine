import StageObjectGetter from "../../../util/konva/StageObjectGetter.js";

class ImagePreparer {
    /**
     * @param {StageObjectGetter} stageObjectGetter
     */
    constructor(stageObjectGetter) {
        this.stageObjectGetter = stageObjectGetter;
    }

    /**
     * Prepare images from a container (layer or group)
     * @param {Konva.Node} container
     */
    prepareImages(container) {
        for (const object of container.children) {
            if (object.className == 'Image') {
                this.loadImageObject(object.attrs.id, object.attrs.src);
            }
        }
    }

    /**
     * Loads an image for the stage and sets up its onload handler.
     * The image is cached globally to ensure it stays in memory while loading.
     * @param {string} id the identifier for the image object
     * @param {string} imageSrc the source URL of the image
     */
    loadImageObject(id, imageSrc) {
        window[id] = new Image();
        window[id].onload = () => {
            this.stageObjectGetter.getObject(id).image(window[id]);
        };
        window[id].src = imageSrc;
    }
}

export default ImagePreparer;
