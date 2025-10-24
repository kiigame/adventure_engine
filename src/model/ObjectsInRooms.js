import EventEmitter from "../events/EventEmitter.js";

class ObjectsInRooms {
    /**
     * @param {object} objectsInRoomsData initial state of the objects in rooms as json
     * @param {EventEmitter} gameEventEmitter
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(objectsInRoomsData, gameEventEmitter, uiEventEmitter) {
        this.objectsInRoomsData = objectsInRoomsData;
        this.gameEventEmitter = gameEventEmitter;
        this.uiEventEmitter = uiEventEmitter;

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
            for (const [room, types] of Object.entries(this.objectsInRoomsData)) {
                for (const [typeName, objects] of Object.entries(types)) {
                    for (const [name, values] of Object.entries(objects)) {
                        if (name === objectName) {
                            this.objectsInRoomsData[room][typeName][name].visible = false;
                            removedObjectNames.push(name);
                        }
                    }
                }
            }
        });
        this.uiEventEmitter.emit(
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
            for (const [room, types] of Object.entries(this.objectsInRoomsData)) {
                for (const [typeName, objects] of Object.entries(types)) {
                    for (const [name, values] of Object.entries(objects)) {
                        if (name === objectName) {
                            this.objectsInRoomsData[room][typeName][name].visible = true;
                            addedObjectNames.push(name);
                        }
                    }
                }
            }
        });
        this.uiEventEmitter.emit(
            'added_objects',
            {
                'objectList': this.objectsInRoomsData,
                'objectsAdded': addedObjectNames
            }
        );
    }
}

export default ObjectsInRooms;
