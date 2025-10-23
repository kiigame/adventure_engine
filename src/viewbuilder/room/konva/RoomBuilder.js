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
        roomJson = this.addBackground(roomJson);
        roomJson.className = "Group";
        return roomJson;
    }

    prepareObject(key, roomJson) {
        if (!Object.keys(roomJson).includes(key)) {
            return undefined;
        }
        const json = JSON.parse(JSON.stringify(roomJson[key]));
        delete roomJson[key];
        if (!json || !Object.keys(json).length) {
            return undefined;
        }
        return json;
    }

    addBackground(roomJson) {
        const backgroundJson = this.prepareObject('background', roomJson);
        if (backgroundJson) {
            const background = this.buildBackground(backgroundJson);
            if (Object.keys(background).length > 0) {
                roomJson.children.unshift(background);
            }
        }

        return roomJson;
    }

    buildBackground(backgroundJson) {
        // TODO: make configurable / responsive / etc / etc
        const bgWidth = 981;
        const bgHeight = 543;

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
        return background;
    }
}

export default RoomBuilder;
