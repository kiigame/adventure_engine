import { EventEmitter } from "../events/EventEmitter.js";

class ObjectsInRooms {
    /**
     * @param {object} objectsInRoomsData initial state of the objects in rooms as json
     * @param {EventEmitter} gameEventEmitter
     */
    constructor(objectsInRoomsData, gameEventEmitter) {
        this.objectsInRoomsData = objectsInRoomsData;
        this.gameEventEmitter = gameEventEmitter;

        this.gameEventEmitter.on('remove_objects', (objectNames) => {
            this.removeObjects(objectNames);
        });
        this.gameEventEmitter.on('add_objects', ({ objectNames, roomId }) => {
            this.addObjects(objectNames, roomId);
        });
    }

    /**
     * @param {string[]} objectNames
     */
    removeObjects(objectNames) {
        const removedObjectNames = [];
        // TODO: I'm sure there's a more elegant way than this!
        objectNames.forEach((objectName) => {
            for (const [room, objects] of Object.entries(this.objectsInRoomsData)) {
                for (const object of objects) {
                    if (object.name === objectName) {
                        this.objectsInRoomsData[room] = this.objectsInRoomsData[room].filter((obj) => obj.name !== objectName);
                        removedObjectNames.push(object.name);
                    }
                }
            }
        });
        this.gameEventEmitter.emit(
            'removed_objects',
            {
                'objectList': this.objectsInRoomsData,
                'objectsRemoved': removedObjectNames
            }
        );
    }

    /**
     * @param {string[]} objectNames
     * @param {string} roomId
     */
    addObjects(objectNames, roomId) {
        const addedObjectNames = [];
        // TODO: I'm sure there's a more elegant way than this!
        objectNames.forEach((objectName) => {
            for (const [room, objects] of Object.entries(this.objectsInRoomsData)) {
                if (room === roomId && !objects.some((obj) => obj.name === objectName)) {
                    this.objectsInRoomsData[room].push({ name: objectName });
                    addedObjectNames.push(objectName);
                }
            }
        });
        this.gameEventEmitter.emit(
            'added_objects',
            {
                'objectList': this.objectsInRoomsData,
                'objectsAdded': addedObjectNames
            }
        );
    }
}

export default ObjectsInRooms;
