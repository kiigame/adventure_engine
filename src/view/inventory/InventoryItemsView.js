import EventEmitter from "../../events/EventEmitter.js";
import StageObjectGetter from "../stage/StageObjectGetter.js";

class InventoryItemsView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {StageObjectGetter} stageObjectGetter
     * @param {Konva.Group} inventoryItems
     * @param {int} offsetFromTop
     */
    constructor(uiEventEmitter, gameEventEmitter, stageObjectGetter, inventoryItems, offsetFromTop) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.stageObjectGetter = stageObjectGetter;
        this.inventoryItems = inventoryItems;
        // Offset from top for drawing inventory items starting from proper position
        this.offsetFromTop = offsetFromTop;
        // Offset from left for drawing inventory items starting from proper position
        this.offsetFromLeft = 50;

        this.uiEventEmitter.on('dragend_ended', (draggedItem) => {
            this.moveDraggedItemBackToInventory(draggedItem);
        });
        // Handle clicks etc on inventory items
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
                item.attrs.id === visibleItemName;
            });
            if (!shape) {
                shape = this.stageObjectGetter.getObject(visibleItemName);
                shape.moveTo(this.inventoryItems);
                shape.clearCache();
                shape.size({ width: 80, height: 80 });
            }
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
        if (!this.inventoryItems.find((item) => item === target)) {
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
        draggedItem.moveTo(this.inventoryItems)
    }
}

export default InventoryItemsView;
