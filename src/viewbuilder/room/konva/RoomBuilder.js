class RoomBuilder {
    /**
     * @param {object} roomJson room data to prepare
     * @returns {object} room data prepared for Konva to add to the rooms layer
     */
    build(roomJson) {
        roomJson.attrs.visible = false;
        return roomJson;
    }
}

export default RoomBuilder;
