class ObjectsInRoomBuilder {
    /**
     * @param {string[]} roomObjectCategories
     */
    constructor(roomObjectCategories) {
        this.roomObjectCategories = roomObjectCategories;
    };

    build(roomJson) {
        const objectsInRoom = {};
        for (const [category, objects] of Object.entries(roomJson)) {
            if (this.roomObjectCategories.includes(category)) {
                for (const [name, objectData] of Object.entries(objects)) {
                    const objectResult = {};
                    objectResult.category = category;
                    objectResult.visible = objectData.initiallyVisible !== undefined ? objectData.initiallyVisible : true;
                    objectsInRoom[name] = objectResult;
                };
            }
        }
        return objectsInRoom;
    }
}

export default ObjectsInRoomBuilder;
