import EventEmitter from "../events/EventEmitter.js";

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
        this.gameEventEmitter.on('add_objects', (objectNames) => {
            this.addObjects(objectNames);
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
                for (const [name, _values] of Object.entries(objects)) {
                    if (name === objectName) {
                        this.objectsInRoomsData[room][name].visible = false;
                        removedObjectNames.push(name);
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
     */
    addObjects(objectNames) {
        const addedObjectNames = [];
        // TODO: I'm sure there's a more elegant way than this!
        objectNames.forEach((objectName) => {
            for (const [room, objects] of Object.entries(this.objectsInRoomsData)) {
                for (const [name, _values] of Object.entries(objects)) {
                    if (name === objectName) {
                        this.objectsInRoomsData[room][name].visible = true;
                        addedObjectNames.push(name);
                    }
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
