import pkg from "konva";
const { Tween } = pkg;
import EventEmitter from "../../events/EventEmitter.js";

class RoomAnimations {
    /**
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(uiEventEmitter) {
        this.runningAnimations = new Set();
        uiEventEmitter.on('play_room_animations', ({ animatedObjects, roomId }) => {
            this.playRoomAnimations(animatedObjects, roomId);
        });
    }

    /**
     * @param {Tween[]} animatedObjects
     * @param {string} roomId
     */
    playRoomAnimations(animatedObjects, roomId) {
        this.runningAnimations.forEach(anim => anim.stop());
        this.runningAnimations.clear();

        animatedObjects.forEach(animatedObject => {
            if (animatedObject.node.getParent().id() === roomId) {
                animatedObject.play();
                this.runningAnimations.add(animatedObject.anim);
            }
        });
    }
}

export default RoomAnimations;
