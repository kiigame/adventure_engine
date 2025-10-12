import EventEmitter from "../../events/EventEmitter.js";
import StageObjectGetter from "../stage/StageObjectGetter.js";

class InventoryView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {StageObjectGetter} stageObjectGetter
     * @param {Konva.Layer} inventoryBarLayer
     * @param {int} offsetFromTop
     */
    constructor(uiEventEmitter, gameEventEmitter, stageObjectGetter, inventoryBarLayer, offsetFromTop) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.stageObjectGetter = stageObjectGetter;
        this.inventoryBarLayer = inventoryBarLayer;
        this.inventoryItems = this.inventoryBarLayer.findOne((node) => node.attrs.id === 'inventory_items');
        // Offset from top for drawing inventory items starting from proper position
        this.offsetFromTop = offsetFromTop;
        // Offset from left for drawing inventory items starting from proper position
        this.offsetFromLeft = 50;

        this.uiEventEmitter.on('inventory_view_model_updated', ({ visibleInventoryItems, isLeftArrowVisible, isRightArrowVisible }) => {
            this.redrawInventory(visibleInventoryItems, isLeftArrowVisible, isRightArrowVisible);
        });
        this.gameEventEmitter.on('arrived_in_room', (roomId) => {
            // Slightly kludgy way of checking if we want to show inventory
            if (this.stageObjectGetter.getObject(roomId).attrs.fullScreen) {
                return;
            }
            this.showInventory();
        });
        this.uiEventEmitter.on('dragmove_hover_on_object', (target) => {
            this.clearInventoryItemBlur();
            this.glowInventoryItem(target);
            this.drawInventoryLayer();
        });
        this.uiEventEmitter.on('dragmove_hover_on_nothing', () => {
            this.clearInventoryItemBlur();
            this.drawInventoryLayer();
        });
        this.uiEventEmitter.on('inventory_left_arrow_draghovered', () => {
            this.uiEventEmitter.emit('inventory_left_arrow_engaged');
        });
        this.uiEventEmitter.on('inventory_right_arrow_draghovered', () => {
            this.uiEventEmitter.emit('inventory_right_arrow_engaged');
        });
        this.uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.hideInventory();
        });
        this.uiEventEmitter.on('item_moved_to_room_layer', () => {
            this.drawInventoryLayer();
        });
        this.uiEventEmitter.on('dragend_ended', (draggedItem) => {
            this.moveDraggedItemBackToInventory(draggedItem);
        });
        // Handle clicks etc on inventory items and arrows
        this.inventoryItems.on('click tap', (event) => {
            this.uiEventEmitter.emit('inventory_click', event.target);
        });
        this.stageObjectGetter.getObject('inventory_left_arrow').on('click tap', () => {
            this.uiEventEmitter.emit('inventory_left_arrow_engaged');
        });
        this.stageObjectGetter.getObject('inventory_right_arrow').on('click tap', () => {
            this.uiEventEmitter.emit('inventory_right_arrow_engaged');
        });
        this.inventoryItems.on('touchstart mousedown', (event) => {
            this.uiEventEmitter.emit('inventory_touchstart', event.target);
        });
    }

    /**
     * Show given items and inventory arrows.
     *
     * @param {string[]} visibleInventoryItems in order from left to right
     * @param {boolean} isInventoryLeftArrowVisible
     * @param {boolean} isInventoryRightArrowVisible
     */
    redrawInventory(visibleInventoryItems, isInventoryLeftArrowVisible, isInventoryRightArrowVisible) {
        // At first reset all items. Adding or removing items, as well as clicking
        // arrows, may change which items should be shown.
        this.inventoryItems.getChildren().each((shape) => {
            shape.setAttr('visible', false);
        });
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

        if (isInventoryLeftArrowVisible) {
            this.stageObjectGetter.getObject("inventory_left_arrow").show();
        } else {
            this.stageObjectGetter.getObject("inventory_left_arrow").hide();
        }

        if (isInventoryRightArrowVisible) {
            this.stageObjectGetter.getObject("inventory_right_arrow").show();
        } else {
            this.stageObjectGetter.getObject("inventory_right_arrow").hide();
        }

        this.clearInventoryItemBlur();
        this.drawInventoryLayer();
        this.uiEventEmitter.emit('inventory_redrawn');
    }

    showInventory() {
        this.inventoryBarLayer.show();
        this.inventoryItems.show();
        this.drawInventoryLayer();
    }

    hideInventory() {
        this.inventoryItems.hide();
        this.inventoryBarLayer.hide();
    }

    drawInventoryLayer() {
        this.inventoryItems.draw();
        this.inventoryBarLayer.draw();
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

export default InventoryView;
