/**
 * Allow fairly freely adding "pure" Konva objects as children to the room (very flexible!)
 *
 * Quacks like a "RoomChildrenBuilder" (for RoomChildrenTypeBuilder) - implements a buildRoomChildren method
 */
class OtherChildrenBuilder {
    /**
     * @param {object} otherJson other child objects from room.json
     * @returns {object[]} an array of other child objects as Konva objects
     */
    buildRoomChildren(otherJson) {
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

export default OtherChildrenBuilder;
