import { EventEmitter } from "../../events/EventEmitter.js";

class InventoryArrowsViewModel {
    /**
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(uiEventEmitter) {
        this.uiEventEmitter = uiEventEmitter;

        // For limiting the speed of inventory browsing when dragging an item
        this.inventoryScrollDelay = 500;
        this.inventoryScrollDelayEnabled = false;

        this.uiEventEmitter.on('dragmove_hover_on_left_arrow', () => {
            this.handleDragMoveHoverOnLeftArrow();
        });
        this.uiEventEmitter.on('dragmove_hover_on_right_arrow', () => {
            this.handleDragMoveOnRightArrow();
        });
    }

    handleDragMoveHoverOnLeftArrow() {
        if (!this.inventoryScrollDelayEnabled) {
            this.inventoryScrollDelayEnabled = true;
            this.uiEventEmitter.emit('inventory_left_arrow_draghovered');
            setTimeout(() => this.inventoryScrollDelayEnabled = false, this.inventoryScrollDelay);
        }
    }

    handleDragMoveOnRightArrow() {
        if (!this.inventoryScrollDelayEnabled) {
            this.inventoryScrollDelayEnabled = true;
            this.uiEventEmitter.emit('inventory_right_arrow_draghovered');
            setTimeout(() => this.inventoryScrollDelayEnabled = false, this.inventoryScrollDelay);
        }
    }
}

export default InventoryArrowsViewModel;
