import pkg from "konva";
const { Tween } = pkg;
import EventEmitter from "../../events/EventEmitter.js";

class RoomAnimationsPlayer {
    /**
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(uiEventEmitter) {
        uiEventEmitter.on('play_room_animations', ({ animatedObjects, roomId }) => {
            this.playRoomAnimations(animatedObjects, roomId);
        });
    }

    /**
     * @param {Tween[]} animatedObjects
     * @param {string} roomId
     */
    playRoomAnimations(animatedObjects, roomId) {
        for (const animatedObject of animatedObjects) {
            if (animatedObject.node.getParent().id() == roomId) {
                animatedObject.play();
            } else if (animatedObject.anim.isRunning()) {
                animatedObject.anim.stop(); // Should this be .anim.stop() or .pause()?
            }
        }
    }
}

export default RoomAnimationsPlayer;
