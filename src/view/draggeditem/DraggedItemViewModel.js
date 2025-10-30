import EventEmitter from "../../events/EventEmitter.js";
import DragTargetFinder from "./DragTargetFinder.js";
import { Text } from "../../model/Text.js";

class DraggedItemViewModel {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {DragTargetFinder} dragTargetFinder
     * @param {Text} text
     */
    constructor(uiEventEmitter, dragTargetFinder, text) {
        this.uiEventEmitter = uiEventEmitter;
        this.dragTargetFinder = dragTargetFinder;
        this.text = text;

        // For limiting the amount of intersection checks
        this.intersectionDelayEnabled = false;
        // Currently dragged item
        this.draggedItem = undefined;
        // Intersection target (object below dragged item)
        this.target = undefined;

        this.uiEventEmitter.on('inventory_item_drag_start', ({ draggedItem }) => {
            this.handleInventoryItemDragStart(draggedItem);
        });
        this.uiEventEmitter.on('inventory_item_drag_end_interactions_handled', () => {
            this.wrapUpDragEnd();
        });
    }

    /**
     * @param {Konva.Shape} draggedItem
     */
    handleInventoryItemDragStart(draggedItem) {
        this.draggedItem = draggedItem;
        this.draggedItem.on('dragmove', (_event) => {
            this.handleInventoryItemDragMove();
        });
        this.draggedItem.on('dragend', (_event) => {
            this.handleInventoryItemDragEnd();
        });
    }

    handleInventoryItemDragMove() {
        if (!this.intersectionDelayEnabled) {
            // Setting a small delay to not spam intersection check on every moved pixel
            this.setIntersectionDelay(10);

            this.target = this.dragTargetFinder.findDragTarget(this.draggedItem, this.target);
            if (this.target && this.target.category !== 'invArrow') {
                this.targetName = this.text.getName(this.target.id());
            } else {
                this.targetName = undefined;
            }

            if (this.target === undefined) {
                this.uiEventEmitter.emit('dragmove_hover_on_nothing');
                return;
            }

            if (this.target.attrs.category !== 'invArrow') {
                this.uiEventEmitter.emit('dragmove_hover_on_object', {
                    target: this.target,
                    draggedItem: this.draggedItem,
                    targetName: this.targetName
                });
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

    handleInventoryItemDragEnd() {
        // Ending the drag on an inventory arrow does nothing
        if (this.target !== undefined && this.target.attrs.category === 'invArrow') {
            this.wrapUpDragEnd();
            return;
        }
        // If we are already hovering a target, use it
        if (this.target !== undefined) {
            this.uiEventEmitter.emit('inventory_item_drag_end_on_target', { target: this.target, draggedItem: this.draggedItem });
            return;
        }

        // In case we didn't yet get the target set during hover (for example during intersection delay), check now
        const target = this.dragTargetFinder.findDragTarget(this.draggedItem);

        if (target === undefined || target.attrs.category === 'invArrow') {
            this.wrapUpDragEnd();
            return;
        }

        this.uiEventEmitter.emit('inventory_item_drag_end_on_target', { target, draggedItem: this.draggedItem });
    }

    /**
     * Delay to be set after each intersection check
     * @param {int} delay
     */
    setIntersectionDelay(delay) {
        this.intersectionDelayEnabled = true;
        setTimeout(() => this.intersectionDelayEnabled = false, delay);
    }

    /**
     * Unsubscribe listeners, clean up view model.
     */
    wrapUpDragEnd() {
        const draggedItem = this.draggedItem;
        draggedItem.off('dragmove');
        draggedItem.off('dragend');
        this.draggedItem = undefined;
        this.target = undefined;
        this.uiEventEmitter.emit('inventory_item_drag_end_wrapped_up', { draggedItem });
    }
}

export default DraggedItemViewModel;
