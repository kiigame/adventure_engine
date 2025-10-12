import EventEmitter from "../../events/EventEmitter.js";

class RoomAnimations {
    /**
     * @param {EventEmitter} gameEventEmitter
     * @param {Konva.Tween[]} animatedObjects
     */
    constructor(gameEventEmitter, animatedObjects) {
        this.animatedObjects = animatedObjects;
        this.runningAnimations = new Set();
        gameEventEmitter.on('remove_object', (objectName) => {
            this.removeAnimation(objectName);
        });
        gameEventEmitter.on('arrived_in_room', (roomId) => {
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
