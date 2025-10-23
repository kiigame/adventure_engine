/**
 * Quacks like a "RoomChildrenBuilder" (for RoomChildrenTypeBuilder) - implements a buildRoomChildren method
 */
class FurnitureBuilder {
    /**
     * Transform furniture data in to Konva object json.
     * @param {object} furnitureJson furniture from room.json
     * @returns {object[]} an array of furniture as Konva objects
     */
    buildRoomChildren(furnitureJson) {
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
}

export default FurnitureBuilder;
