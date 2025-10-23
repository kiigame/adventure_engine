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
        roomJson = this.addChildren(roomJson, 'backgrounds', this.buildBackgrounds);
        roomJson = this.addChildren(roomJson, 'furniture', this.buildFurniture);
        roomJson = this.addChildren(roomJson, 'other', this.buildOther);
        roomJson.className = "Group";
        return roomJson;
    }

    /**
     * Prepares room child data from rooms.json by key.
     * @param {string} key
     * @param {object} roomJson room from rooms.json
     * @returns json of child data, may or may not be an array
     */
    prepareChildData(key, roomJson) {
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

    /**
     * Adds children to the Konva room data.
     * @param {object} roomJson room from rooms.json
     * @param {string} key
     * @param {Function} callback for building an array of Konva json objects
     * @returns {object} the modified room json
     */
    addChildren(roomJson, key, callback) {
        const json = this.prepareChildData(key, roomJson);
        if (json) {
            const objectArray = callback(json);
            objectArray.forEach((object) => {
                if (Object.keys(object).length > 0) {
                    roomJson.children.push(object);
                }
            });
        }

        return roomJson;
    }

    /**
     * Build Konva-ready json data from background data in rooms.json. The engine only supports one backgorund
     * image for a room, but from data we technically can build multiple.
     *
     * @param {object} backgroundsJson background json objects from rooms.json
     * @returns {object[]} array of backgrounds as Konva object jsons
     */
    buildBackgrounds(backgroundsJson) {
        // TODO: make configurable / responsive / etc / etc
        const bgWidth = 981;
        const bgHeight = 543;

        const backgrounds = [];
        for (const [key, backgroundJson] of Object.entries(backgroundsJson)) {
            const background = {};
            background.attrs = {
                "category": "room_background",
                "id": key,
                "src": backgroundJson.src,
                "visible": true,
                "width": bgWidth,
                "height": bgHeight
            };
            background.className = "Image";
            backgrounds.push(background);
        }
        return backgrounds;
    }

    /**
     * Transform furniture data in to Konva object json.
     * @param {object} furnitureJson furniture from room.json
     * @returns {object[]} an array of furniture as Konva objects
     */
    buildFurniture(furnitureJson) {
        const furnitureResult = [];
        for (const [key, furniture] of Object.entries(furnitureJson)) {
            if (!furniture.attrs) {
                furniture.attrs = {};
            }
            furniture.attrs.id = key;
            furniture.attrs.category = "furniture";
            furnitureResult.push(furniture);
        }
        return furnitureResult;
    }

    /**
     * TODO: maybe do something with the 'other' data? Currently it allows defining any kind of additional
     * Konva objects to the room.
     *
     * @param {object} otherJson other child objects from room.json
     * @returns {object[]} an array of other child objects as Konva objects
     */
    buildOther(otherJson) {
        const otherResult = [];
        for (const [key, other] of Object.entries(otherJson)) {
            if (!other.attrs) {
                other.attrs = {};
            }
            other.attrs.id = key;
            otherResult.push(other);
        }
        return otherResult;
    }
}

export default RoomBuilder;
