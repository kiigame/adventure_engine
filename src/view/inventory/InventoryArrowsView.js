import EventEmitter from "../../events/EventEmitter.js";

class InventoryArrowsView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Shape} leftArrow
     * @param {Konva.Shape} rightArrow
     */
    constructor(uiEventEmitter, leftArrow, rightArrow) {
        this.uiEventEmitter = uiEventEmitter;
        this.leftArrow = leftArrow;
        this.rightArrow = rightArrow;

        // Handle arrow clicks and hovers
        this.leftArrow.on('click tap', () => {
            this.uiEventEmitter.emit('inventory_left_arrow_engaged');
        });
        this.rightArrow.on('click tap', () => {
            this.uiEventEmitter.emit('inventory_right_arrow_engaged');
        });
        this.uiEventEmitter.on('inventory_left_arrow_draghovered', () => {
            this.uiEventEmitter.emit('inventory_left_arrow_engaged');
        });
        this.uiEventEmitter.on('inventory_right_arrow_draghovered', () => {
            this.uiEventEmitter.emit('inventory_right_arrow_engaged');
        });
    }

    /**
     * @param {boolean} isInventoryLeftArrowVisible
     * @param {boolean} isInventoryRightArrowVisible
     */
    toggleArrowVisibility(isInventoryLeftArrowVisible, isInventoryRightArrowVisible) {
        if (isInventoryLeftArrowVisible) {
            this.leftArrow.show();
        } else {
            this.leftArrow.hide();
        }

        if (isInventoryRightArrowVisible) {
            this.rightArrow.show();
        } else {
            this.rightArrow.hide();
        }
    }
}

export default InventoryArrowsView;
