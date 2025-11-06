import { StageObjectGetter } from "../../../util/konva/StageObjectGetter.js";
import Konva from 'konva';

declare global {
    interface Window {
        [key: string]: typeof Image | any;
    }
}

export class ImagePreparer {
    private stageObjectGetter: StageObjectGetter;

    /**
     * @param {StageObjectGetter} stageObjectGetter
     */
    constructor(stageObjectGetter: StageObjectGetter) {
        this.stageObjectGetter = stageObjectGetter;
    }

    /**
     * Prepare images from a container (layer or group)
     * @param {Konva.Node} container
     */
    prepareImages(container: Konva.Node) {
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
    loadImageObject(id: string, imageSrc: string) {
        window[id] = new Image();
        window[id].onload = () => {
            // We trust prepareImages has made sure we are dealing with a Konva.Image
            const konvaImage: Konva.Image = this.stageObjectGetter.getObject(id) as Konva.Image;
            konvaImage.image(window[id]);
        };
        window[id].src = imageSrc;
    }
}
