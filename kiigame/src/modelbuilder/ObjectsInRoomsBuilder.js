import ObjectsInRoomBuilder from "./ObjectsInRoomBuilder.js";

class ObjectsInRoomsBuilder {
    /**
     * @param {ObjectsInRoomBuilder} objectsInRoomBuilder
     */
    constructor(objectsInRoomBuilder) {
        this.objectsInRoomBuilder = objectsInRoomBuilder;
    }

    /**
     * @param {object} roomsJson rooms data in json object
     * @returns {object[]} prepared rooms data
     */
    build(roomsJson) {
        const objectsInRoomsData = {};
        for (const [name, room] of Object.entries(roomsJson)) {
            objectsInRoomsData[name] = this.objectsInRoomBuilder.build(room);
        };
        return objectsInRoomsData;
    }
}

export default ObjectsInRoomsBuilder;
