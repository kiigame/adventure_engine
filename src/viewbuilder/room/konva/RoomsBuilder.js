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
        roomsJson.forEach((room) => {
            konvaRoomData.push(
                this.roomBuilder.build(room)
            );
        });
        return konvaRoomData;
    }
}

export default RoomsBuilder;
