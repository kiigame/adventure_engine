import RoomBuilder from './RoomBuilder.js';

class RoomsBuilder {
    /**
     * @param {RoomBuilder} roomBuilder
     */
    constructor(roomBuilder) {
        this.roomBuilder = roomBuilder;
    }

    /**
     * @param {object} roomsJson rooms data in json object
     * @returns {object[]} rooms data prepared for Konva to add to the rooms layer
     */
    build(roomsJson) {
        const konvaRoomData = [];
        for (const [name, room] of Object.entries(roomsJson)) {
            konvaRoomData.push(
                this.roomBuilder.build(name, room)
            );
        };
        return konvaRoomData;
    }
}

export default RoomsBuilder;
