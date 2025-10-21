import EventEmitter from "../../events/EventEmitter.js";

class InventoryItemsView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {Konva.Group} inventoryItems
     * @param {int} offsetFromTop
     */
    constructor(uiEventEmitter, gameEventEmitter, inventoryItems, offsetFromTop) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.inventoryItems = inventoryItems;
        // Offset from top for drawing inventory items starting from proper position
        this.offsetFromTop = offsetFromTop;
        // Offset from left for drawing inventory items starting from proper position
        this.offsetFromLeft = 50;

        this.uiEventEmitter.on('dragend_ended', (draggedItem) => {
            this.moveDraggedItemBackToInventory(draggedItem);
        });
        // Handle drags and clicks on inventory items
        this.inventoryItems.find('Image').on('dragstart', (event) => {
            this.uiEventEmitter.emit('inventory_drag_start', event.target);
        });
        this.inventoryItems.on('click tap', (event) => {
            this.uiEventEmitter.emit('inventory_click', event.target);
        });
        this.inventoryItems.on('touchstart mousedown', (event) => {
            this.uiEventEmitter.emit('inventory_touchstart', event.target);
        });
    }

    resetItems() {
        this.inventoryItems.getChildren().each((shape) => {
            shape.setAttr('visible', false);
        });
    }

    handleInventoryItemVisibility(visibleInventoryItems) {
        visibleInventoryItems.forEach((visibleItemName, index) => {
            let shape = this.inventoryItems.findOne((item) => {
                return item.attrs.id === visibleItemName;
            });
            shape.x(this.offsetFromLeft + (index * 100));
            shape.y(this.offsetFromTop);
            shape.setAttr('visible', true);
        });
    }

    show() {
        this.inventoryItems.show();
    }

    hide() {
        this.inventoryItems.hide();
    }

    draw() {
        this.inventoryItems.draw();
    }

    clearInventoryItemBlur() {
        this.inventoryItems.getChildren().each((shape) => {
            shape.shadowBlur(0);
        });
    }

    glowInventoryItem(target) {
        // check that target is in inventory
        if (!this.inventoryItems.findOne((item) => item === target)) {
            return;
        }
        target.clearCache();
        target.shadowColor('purple');
        target.shadowOffset({ x: 0, y: 0 });
        target.shadowBlur(20);
    }

    getVisibleInventoryItems() {
        return this.inventoryItems.find((item) => item.attrs.visible === true);
    }

    moveDraggedItemBackToInventory(draggedItem) {
        if (!draggedItem) {
            return;
        }
        draggedItem.moveTo(this.inventoryItems);
    }
}

export default InventoryItemsView;
