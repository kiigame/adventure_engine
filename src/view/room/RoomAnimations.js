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
        uiEventEmitter.on('room_became_visible', (roomId) => {
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
        this.animatedObjects = this.animatedObjects.filter((animatedObject) => {
            return animatedObject.node.id() !== id;
        });
    }
}

export default RoomAnimations;
