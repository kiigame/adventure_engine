class RoomBuilder {
    /**
     * @param {object} roomJson room data to prepare
     * @returns {object} room data prepared for Konva to add to the rooms layer
     */
    build(roomJson) {
        roomJson.attrs.visible = false;
        roomJson = this.buildBackground(roomJson);
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
            if (!roomJson.children) {
                roomJson.children = [];
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
