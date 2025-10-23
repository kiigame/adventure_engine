class RoomBuilder {
    /**
     * @param {string} name the name of the room
     * @param {object} roomJson room data to prepare
     * @returns {object} room data prepared for Konva to add to the rooms layer
     */
    build(name, roomJson) {
        roomJson.attrs = {};
        roomJson.attrs.id = name;
        roomJson.attrs.category = "room";
        roomJson.attrs.visible = false;
        if (Object.keys(roomJson).includes('fullScreen')) {
            roomJson.attrs.fullScreen = roomJson.fullScreen;
            delete roomJson.fullScreen;
        }
        if (!roomJson.children) {
            roomJson.children = [];
        }
        roomJson = this.buildBackground(roomJson);
        roomJson.className = "Group";
        return roomJson;
    }

    buildBackground(roomJson) {
        // TODO: make configurable / responsive / etc / etc
        const bgWidth = 981;
        const bgHeight = 543;

        if (Object.keys(roomJson).includes('background')) {
            const backgroundJson = JSON.parse(JSON.stringify(roomJson.background));
            delete roomJson.background;
            if (!backgroundJson || !Object.keys(backgroundJson).length) {
                return roomJson;
            }
            const background = {};
            if (backgroundJson.src) {
                background.attrs = {
                    "category": "room_background",
                    "src": backgroundJson.src,
                    "visible": true,
                    "width": bgWidth,
                    "height": bgHeight
                };
                background.className = "Image";
            }
            if (backgroundJson.id) {
                background.attrs.id = backgroundJson.id;
            }
            if (Object.keys(background).length > 0) {
                roomJson.children.unshift(background);
            }
        }
        return roomJson;
    }
}

export default RoomBuilder;
