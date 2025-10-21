import EventEmitter from "../../events/EventEmitter.js";
import StageObjectGetter from "../../util/konva/StageObjectGetter.js";
import InventoryItemsView from "./InventoryItemsView.js"

class InventoryView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {StageObjectGetter} stageObjectGetter
     * @param {Konva.Layer} inventoryBarLayer
     * @param {InventoryItemsView} inventoryItemsView
     */
    constructor(uiEventEmitter, gameEventEmitter, stageObjectGetter, inventoryBarLayer, inventoryItemsView) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.stageObjectGetter = stageObjectGetter;
        this.inventoryBarLayer = inventoryBarLayer;
        this.inventoryItemsView = inventoryItemsView;

        this.leftArrow = this.inventoryBarLayer.find('#inventory_left_arrow');
        this.rightArrow = this.inventoryBarLayer.find('#inventory_right_arrow');

        this.uiEventEmitter.on('inventory_view_model_updated', ({ visibleInventoryItems, isLeftArrowVisible, isRightArrowVisible }) => {
            this.redrawInventory(visibleInventoryItems, isLeftArrowVisible, isRightArrowVisible);
        });
        this.gameEventEmitter.on('arrived_in_room', (roomId) => {
            this.handleArrivedInRoom(roomId);
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
        this.uiEventEmitter.on('dragmove_hover_on_object', ({ target, dragged_item: _dragged_item }) => {
            this.handleDragMoveHoverOnObject(target);
        });
        this.uiEventEmitter.on('dragmove_hover_on_nothing', () => {
            this.handleDragMoveHoverOnNothing();
        });
        // Handle clicks on arrows
        this.leftArrow.on('click tap', () => {
            this.uiEventEmitter.emit('inventory_left_arrow_engaged');
        });
        this.rightArrow.on('click tap', () => {
            this.uiEventEmitter.emit('inventory_right_arrow_engaged');
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
        this.inventoryItemsView.resetItems();
        this.inventoryItemsView.handleInventoryItemVisibility(visibleInventoryItems);

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

        this.inventoryItemsView.clearInventoryItemBlur();
        this.drawInventoryLayer();
        this.uiEventEmitter.emit('inventory_redrawn');
    }

    showInventory() {
        this.inventoryBarLayer.show();
        this.inventoryItemsView.show();
        this.drawInventoryLayer();
    }

    hideInventory() {
        this.inventoryItemsView.hide();
        this.inventoryBarLayer.hide();
    }

    drawInventoryLayer() {
        this.inventoryItemsView.draw();
        this.inventoryBarLayer.draw();
    }

    handleArrivedInRoom(roomId) {
        // Slightly kludgy way of checking if we want to show inventory
        if (this.stageObjectGetter.getObject(roomId).attrs.fullScreen) {
            return;
        }
        this.showInventory();
    }

    handleDragMoveHoverOnObject(target) {
        this.inventoryItemsView.clearInventoryItemBlur();
        this.inventoryItemsView.glowInventoryItem(target);
        this.drawInventoryLayer();
    }

    handleDragMoveHoverOnNothing() {
        this.inventoryItemsView.clearInventoryItemBlur();
        this.drawInventoryLayer();
    }
}

export default InventoryView;
