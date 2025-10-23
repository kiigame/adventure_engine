/**
 * "Abstract" class that builds an array of one type of room children as Konva objects, and pushes them to the
 * "children" array of the room Group.
 *
 * You should be able to implement a new RoomChildrenBuilder for a new type of a room child, add it to the list
 * of RoomChildrenTypeBuilders for RoomBuilder and have the Konva view implementation for awesome new room features
 * up in no time at all.
 */
class RoomChildrenTypeBuilder {
    /**
     * @param {string} type name of the type of children - key in rooms.json
     * @param {*} roomChildrenBuilder implementation for a specific type of room children
     */
    constructor(type, roomChildrenBuilder) {
        this.type = type;
        this.roomChildrenBuilder = roomChildrenBuilder;
    }

    /**
     * Prepares room child data from rooms.json by key.
     * @param {string} key
     * @param {object} roomJson room from rooms.json
     * @returns json of child data
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
     * @returns {object} the modified room json
     */
    addChildren(roomJson) {
        const json = this.prepareChildData(this.type, roomJson);
        if (json) {
            const objectArray = this.roomChildrenBuilder.buildRoomChildren(json);
            objectArray.forEach((object) => {
                if (Object.keys(object).length > 0) {
                    roomJson.children.push(object);
                }
            });
        }

        return roomJson;
    }
}

export default RoomChildrenTypeBuilder;
