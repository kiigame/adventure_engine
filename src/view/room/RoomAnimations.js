import { EventEmitter } from "../../events/EventEmitter.js";

class RoomAnimations {
    /**
     * @param {EventEmitter} gameEventEmitter
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Tween[]} animatedObjects
     */
    constructor(gameEventEmitter, uiEventEmitter, animatedObjects) {
        this.animatedObjects = animatedObjects;
        this.runningAnimations = new Set();
        gameEventEmitter.on('removed_objects', ({ objectList: _objectList, objectsRemoved }) => {
            this.removeAnimations(objectsRemoved);
        });
        uiEventEmitter.on('arrived_in_room', (roomId) => {
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
     * Removes objects from the list of animated objects
     * @param {string[]} ids The ids of the object to be de-animated
     */
    removeAnimations(ids) {
        this.animatedObjects = this.animatedObjects.filter((animatedObject) => {
            return !ids.includes(animatedObject.node.id());
        });
    }
}

export default RoomAnimations;
