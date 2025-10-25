import EventEmitter from "../../events/EventEmitter.js";
import DragTargetFinder from "./DragTargetFinder.js";

class DraggedItemViewModel {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {DragTargetFinder} dragTargetFinder
     */
    constructor(uiEventEmitter, dragTargetFinder) {
        this.uiEventEmitter = uiEventEmitter;
        this.dragTargetFinder = dragTargetFinder;

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
     * @param {Konva.Shape} draggedItem
     */
    handleInventoryItemDragMove(draggedItem) {
        if (!this.intersectionDelayEnabled) {
            // Setting a small delay to not spam intersection check on every moved pixel
            this.setIntersectionDelay(10);

            this.target = this.dragTargetFinder.findDragTarget(draggedItem, this.target);

            if (this.target === undefined) {
                this.uiEventEmitter.emit('dragmove_hover_on_nothing');
                return;
            }

            if (this.target.attrs.category !== 'invArrow') {
                this.uiEventEmitter.emit('dragmove_hover_on_object', { target: this.target, draggedItem });
                return;
            }

            if (this.target.attrs.id === 'inventory_left_arrow') {
                this.uiEventEmitter.emit('dragmove_hover_on_left_arrow');
                return;
            }
            if (this.target.attrs.id === 'inventory_right_arrow') {
                this.uiEventEmitter.emit('dragmove_hover_on_right_arrow');
                return;
            }
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
        const target = this.dragTargetFinder.findDragTarget(draggedItem);

        if (target === undefined || target.attrs.category === 'invArrow') {
            this.uiEventEmitter.emit('inventory_item_drag_end_handled', draggedItem);
            return;
        }

        this.uiEventEmitter.emit('inventory_item_drag_end_on_target', { target, draggedItem });
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
