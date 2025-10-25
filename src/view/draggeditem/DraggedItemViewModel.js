import EventEmitter from "../../events/EventEmitter.js";
import Intersection from "./intersection/Intersection.js";
import RoomView from "../room/RoomView.js";
import InventoryView from "../inventory/InventoryView.js";
import InventoryArrowsViewModel from "../inventory/InventoryArrowsViewModel.js";

class DraggedItemViewModel {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Intersection} intersection
     * @param {RoomView} roomView
     * @param {InventoryView} inventoryView
     * @param {InventoryArrowsViewModel} inventoryArrowsViewModel
     */
    constructor(uiEventEmitter, intersection, roomView, inventoryView, inventoryArrowsViewModel) {
        this.uiEventEmitter = uiEventEmitter;
        this.intersection = intersection;
        this.roomView = roomView;
        this.inventoryView = inventoryView;
        this.inventoryArrowsViewModel = inventoryArrowsViewModel;

        // For limiting the amount of intersection checks
        this.intersectionDelayEnabled = false;
        // Intersection target (object below dragged item)
        this.target = undefined;

        this.uiEventEmitter.on('inventory_item_drag_move', ({ draggedItem }) => {
            this.handleInventoryItemDragMove(draggedItem);
        });
        this.uiEventEmitter.on('inventory_item_drag_end', ({ draggedItem }) => {
            this.handleInventoryItemDragEnd(draggedItem);
        });
        this.uiEventEmitter.on('inventory_item_drag_end_handled', (_draggedItem) => {
            this.target = undefined;
        });
    }

    /**
     * Drag move events (hover item over, in order of priority: inventory arrows, room object, inventory item)
     * @param {Konva.Shape} draggedItem
     */
    handleInventoryItemDragMove(draggedItem) {
        if (!this.intersectionDelayEnabled) {
            // Setting a small delay to not spam intersection check on every moved pixel
            this.setIntersectionDelay(10);

            // Check if we are dragging over valid room objects or inventory items
            this.target = this.findDragTarget(draggedItem, this.target);

            if (this.target === undefined) {
                this.uiEventEmitter.emit('dragmove_hover_on_nothing');
                return;
            }

            if (this.target.attrs.category === 'invArrow') {
                if (!this.inventoryArrowsViewModel.getInventoryScrollDelayEnabled()) {
                    if (this.target.attrs.id === 'inventory_left_arrow') {
                        this.inventoryArrowsViewModel.handleDragMoveHoverOnLeftArrow();
                        return;
                    }
                    if (this.target.attrs.id === 'inventory_right_arrow') {
                        this.inventoryArrowsViewModel.handleDragMoveOnRightArrow();
                        return;
                    }
                }
                return;
            }

            this.uiEventEmitter.emit('dragmove_hover_on_object', { target: this.target, draggedItem });
        }
    }

    /**
     * @param {Konva.Shape} draggedItem
     */
    handleInventoryItemDragEnd(draggedItem) {
        // Ending the drag on an inventory arrow does nothing
        if (this.target !== undefined && this.target.attrs.category === 'invArrow') {
            this.uiEventEmitter.emit('inventory_item_drag_end_handled', draggedItem);
            return;
        }
        // If we are already hovering a target, use it
        if (this.target !== undefined) {
            this.uiEventEmitter.emit('inventory_item_drag_end_on_target', { target: this.target, draggedItem });
            return;
        }

        // In case we didn't yet get the target set during hover (for example during intersection delay), check now
        const target = this.findDragTarget(draggedItem);

        if (target === undefined || target.attrs.category === 'invArrow') {
            this.uiEventEmitter.emit('inventory_item_drag_end_handled', draggedItem);
            return;
        }

        this.uiEventEmitter.emit('inventory_item_drag_end_on_target', { target, draggedItem });
    }

    /**
     * @param {Konva.Shape} draggedItem
     * @param {Konva.Shape|undefined} previousTarget
     * @returns {Konva.Shape|undefined}
     */
    findDragTarget(draggedItem, previousTarget = undefined) {
        const candidates = [
            ...[this.inventoryView.inventoryArrowsView.leftArrow, this.inventoryView.inventoryArrowsView.rightArrow],
            ...[previousTarget],
            ...this.roomView.getVisibleObjectsFromCurrentRoom(),
            ...this.inventoryView.inventoryItemsView.getVisibleInventoryItems()
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

    /**
     * Delay to be set after each intersection check
     * @param {int} delay
     */
    setIntersectionDelay(delay) {
        this.intersectionDelayEnabled = true;
        setTimeout(() => this.intersectionDelayEnabled = false, delay);
    }
}

export default DraggedItemViewModel;
