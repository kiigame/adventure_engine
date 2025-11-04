import { RoomChildrenBuilder } from "./RoomChildrenBuilder.js";

/**
 * Allow fairly freely adding "pure" Konva objects as children to the room (very flexible!)
 */
export class OtherChildrenBuilder implements RoomChildrenBuilder {
    /**
     * @param {any[]} otherJson other child objects from room.json
     * @returns {any[]} an array of other child objects as Konva objects
     */
    buildRoomChildren(otherJson: any[]): any[] {
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
