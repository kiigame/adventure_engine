import EventEmitter from "../../events/EventEmitter.js";

class InventoryArrowsView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Group} inventoryArrows
     */
    constructor(uiEventEmitter, inventoryArrows) {
        this.uiEventEmitter = uiEventEmitter;
        this.inventoryArrows = inventoryArrows;
        this.leftArrow = this.inventoryArrows.find('#inventory_left_arrow')[0];
        this.rightArrow = this.inventoryArrows.find('#inventory_right_arrow')[0];

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

    show() {
        this.inventoryArrows.show();
    }

    hide() {
        this.inventoryArrows.hide();
    }

    draw() {
        this.inventoryArrows.draw();
    }
}

export default InventoryArrowsView;
