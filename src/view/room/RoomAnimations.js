import pkg from "konva";
const { Tween } = pkg;
import EventEmitter from "../../events/EventEmitter.js";

class RoomAnimations {
    /**
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(uiEventEmitter) {
        this.animatedObjects = []; // Tween[]
        this.runningAnimations = new Set();
        uiEventEmitter.on('play_room_animations', (roomId) => {
            this.playRoomAnimations(roomId);
        });
    }

    /**
     * @param {string} roomId
     */
    playRoomAnimations(roomId) {
        this.runningAnimations.forEach(anim => anim.stop());
        this.runningAnimations.clear();

        this.animatedObjects.forEach(animatedObject => {
            if (animatedObject.node.getParent().id() === roomId) {
                animatedObject.play();
                this.runningAnimations.add(animatedObject.anim);
            }
        });
    }
}

export default RoomAnimations;
