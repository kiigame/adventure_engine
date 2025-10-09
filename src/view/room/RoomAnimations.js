import pkg from "konva";
const { Tween } = pkg;
import EventEmitter from "../../events/EventEmitter.js";

class RoomAnimations {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     */
    constructor(uiEventEmitter, gameEventEmitter) {
        this.animatedObjects = []; // Tween[]
        this.runningAnimations = new Set();
        gameEventEmitter.on('remove_object', (objectName) => {
            this.removeAnimation(objectName);
        });
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

    /**
     * Remove an object from the list of animated objects
     * @param {string} id The id of the object to be de-animated
     */
    removeAnimation(id) {
        if (this.animatedObjects.indexOf(id) > -1) {
            this.animatedObjects.splice(
                this.animatedObjects.indexOf(id), 1
            );
        }
    }
}

export default RoomAnimations;
