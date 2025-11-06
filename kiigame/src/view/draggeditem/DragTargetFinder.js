import { Intersection } from "./intersection/Intersection.js";
import RoomView from "../room/RoomView.js";
import InventoryArrowsView from "../inventory/InventoryArrowsView.js";
import InventoryItemsView from "../inventory/InventoryItemsView.js";

class DragTargetFinder {
    /**
     * @param {Intersection} intersection
     * @param {RoomView} roomView
     * @param {InventoryItemsView} inventoryItemsView
     * @param {InventoryArrowsView} inventoryArrowsView
     */
    constructor(intersection, roomView, inventoryItemsView, inventoryArrowsView) {
        this.intersection = intersection;
        this.roomView = roomView;
        this.inventoryItemsView = inventoryItemsView;
        this.inventoryArrowsView = inventoryArrowsView;
    }

    /**
     * @param {Konva.Shape} draggedItem
     * @param {Konva.Shape|undefined} previousTarget
     * @returns {Konva.Shape|undefined}
     */
    findDragTarget(draggedItem, previousTarget = undefined) {
        const candidates = [
            ...[this.inventoryArrowsView.leftArrow, this.inventoryArrowsView.rightArrow],
            ...[previousTarget],
            ...this.roomView.getVisibleObjectsFromCurrentRoom(),
            ...this.inventoryItemsView.getVisibleInventoryItems()
        ];
        let target = undefined;
        for (let i = 0; i < candidates.length; i++) {
            const object = candidates[i];
            if (object !== undefined && this.intersection.check(draggedItem, object)) {
                target = object;
                break;
            }
        }
        return target;
    }
}

export default DragTargetFinder;
