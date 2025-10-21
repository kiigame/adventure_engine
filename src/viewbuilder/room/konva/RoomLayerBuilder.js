import KonvaObjectLayerPusher from "../../util/konva/KonvaObjectLayerPusher";
import RoomFaderBuilder from "./RoomFaderBuilder";
import ImagePreparer from "../../stage/konva/ImagePreparer";

class RoomLayerBuilder {
    /**
     * @param {KonvaObjectLayerPusher} konvaObjectLayerPusher
     * @param {RoomFaderBuilder} roomFaderBuilder
     * @param {ImagePreparer} imagePreparer
     * @param {object} rooms_json
     * @param {Konva.Layer} roomLayer
     */
    constructor(konvaObjectLayerPusher, roomFaderBuilder, imagePreparer, rooms_json, roomLayer) {
        this.konvaObjectLayerPusher = konvaObjectLayerPusher;
        this.roomFaderBuilder = roomFaderBuilder;
        this.imagePreparer = imagePreparer;
        this.roomsJson = rooms_json;
        this.roomLayer = roomLayer;
    }

    build(width, height) {
        this.konvaObjectLayerPusher.execute(this.roomsJson, this.roomLayer);
        this.konvaObjectLayerPusher.execute([this.roomFaderBuilder.buildRoomFader()], this.roomLayer);
        for (const child of this.roomLayer.toObject().children) {
            this.imagePreparer.prepareImages(child);
        }
        // Scale room fader UI
        this.roomLayer.find('#black_screen_room').size({ width, height: height - 100 });
    }
}

export default RoomLayerBuilder;
