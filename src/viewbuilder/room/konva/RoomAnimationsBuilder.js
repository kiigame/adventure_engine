import StageObjectGetter from "../../../view/stage/StageObjectGetter.js";
import RoomAnimationBuilder from "./RoomAnimationBuilder.js";

class RoomAnimationsBuilder {
    /**
     * @param {RoomAnimationBuilder} roomAnimationBuilder
     * @param {StageObjectGetter} stageObjectGetter
     */
    constructor (roomAnimationBuilder, stageObjectGetter) {
        this.roomAnimationBuilder = roomAnimationBuilder;
        this.stageObjectGetter = stageObjectGetter;
    }

    /**
     * @param {Konva.Group[]} rooms
     * @returns {Konva.Tween[]}
     */
    build(rooms) {
        const animatedObjects = [];
        rooms.forEach((room) => {
            const newAnimations = this.prepareRoomAnimations(room);
            newAnimations.forEach((animation) => {
                animatedObjects.push(animation);
            });
        });
        return animatedObjects;
    }

    /**
     * Prepare the animations for a room
     * @param {Konva.Group} room
     * @returns {Konva.Tween[]} An array of room animations
     */
    prepareRoomAnimations(room) {
        const roomAnimations = [];
        for (const object of room.children) {
            if (object.className == 'Image' && object.attrs.animated) {
                const animation = this.roomAnimationBuilder.createRoomAnimation(
                    this.stageObjectGetter.getObject(object.attrs.id)
                );
                roomAnimations.push(animation);
            }
        }
        return roomAnimations;
    }
}

export default RoomAnimationsBuilder;
