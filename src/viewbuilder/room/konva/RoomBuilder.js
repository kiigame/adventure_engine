import BackgroundsBuilder from "./BackgroundsBuilder.js";
import FurnitureBuilder from "./FurnitureBuilder.js";
import OtherChildrenBuilder from "./OtherChildrenBuilder.js";
import RoomChildrenTypeBuilder from "./RoomChildrenTypeBuilder.js";

class RoomBuilder {
    /**
     * TODO: Dependency injection
     */
    constructor() {
        // Order may be important - for example, backgrounds should go in first so they don't overlap furniture
        this.roomChildrenBuilders = [
            new RoomChildrenTypeBuilder('backgrounds', new BackgroundsBuilder()),
            new RoomChildrenTypeBuilder('furniture', new FurnitureBuilder()),
            new RoomChildrenTypeBuilder('other', new OtherChildrenBuilder())
        ];
    }

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
        this.roomChildrenBuilders.forEach((builder) => {
            roomJson = builder.addChildren(roomJson);
        });
        roomJson.className = "Group";
        return roomJson;
    }
}

export default RoomBuilder;
