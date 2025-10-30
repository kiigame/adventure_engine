import KonvaObjectContainerPusher from "../../util/konva/KonvaObjectContainerPusher.js";
import RoomFaderBuilder from "./RoomFaderBuilder.js";
import ImagePreparer from "../../util/konva/ImagePreparer.js";
import RoomsBuilder from "./RoomsBuilder.js";

class RoomLayerBuilder {
    /**
     * @param {RoomsBuilder} roomsBuilder
     * @param {KonvaObjectContainerPusher} konvaObjectContainerPusher
     * @param {RoomFaderBuilder} roomFaderBuilder
     * @param {ImagePreparer} imagePreparer
     * @param {object} rooms_json
     * @param {Konva.Layer} roomLayer
     */
    constructor(roomsBuilder, konvaObjectContainerPusher, roomFaderBuilder, imagePreparer, rooms_json, roomLayer) {
        this.roomsBuilder = roomsBuilder;
        this.konvaObjectContainerPusher = konvaObjectContainerPusher;
        this.roomFaderBuilder = roomFaderBuilder;
        this.imagePreparer = imagePreparer;
        this.roomsJson = rooms_json;
        this.roomLayer = roomLayer;
    }

    /**
     * @param {int} width stage width in pixels
     * @param {int} height stage height in pixels
     */
    build(width, height) {
        const konvaRoomsJson = this.roomsBuilder.build(this.roomsJson);
        this.konvaObjectContainerPusher.execute(konvaRoomsJson, this.roomLayer);
        this.konvaObjectContainerPusher.execute([this.roomFaderBuilder.buildRoomFader()], this.roomLayer);
        for (const child of this.roomLayer.toObject().children) {
            this.imagePreparer.prepareImages(child);
        }
        // Scale room fader UI
        this.roomLayer.find('#black_screen_room').size({ width, height: height - 100 });
        // Move npc speec bubble on top of rooms so it's visible
        this.roomLayer.find('#npc_speech_bubble').moveToTop();
    }
}

export default RoomLayerBuilder;
