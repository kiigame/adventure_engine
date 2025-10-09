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
        for (const i in animatedObjects) {
            if (animatedObjects[i].node.getParent().id() == roomId) {
                animatedObjects[i].play();
            } else if (animatedObjects[i].anim.isRunning()) {
                animatedObjects[i].anim.stop(); // Should this be .anim.stop() or .pause()?
            }
        }
    }
}

export default RoomAnimationsPlayer;
