import { EventEmitter } from "../../events/EventEmitter.js";
import { StageObjectGetter } from "../../util/konva/StageObjectGetter.js";
import InventoryItemsView from "./InventoryItemsView.js"
import InventoryArrowsView from "./InventoryArrowsView.js"

class InventoryView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {StageObjectGetter} stageObjectGetter
     * @param {Konva.Layer} inventoryBarLayer
     * @param {InventoryItemsView} inventoryItemsView
     * @param {InventoryArrowsView} inventoryArrowsView
     */
    constructor(uiEventEmitter, stageObjectGetter, inventoryBarLayer, inventoryItemsView, inventoryArrowsView) {
        this.uiEventEmitter = uiEventEmitter;
        this.stageObjectGetter = stageObjectGetter;
        this.inventoryBarLayer = inventoryBarLayer;
        this.inventoryItemsView = inventoryItemsView;
        this.inventoryArrowsView = inventoryArrowsView;

        this.uiEventEmitter.on('inventory_view_model_updated', ({ visibleInventoryItems, isLeftArrowVisible, isRightArrowVisible }) => {
            this.redrawInventory(visibleInventoryItems, isLeftArrowVisible, isRightArrowVisible);
        });
        this.uiEventEmitter.on('arrived_in_room', (roomId) => {
            this.handleArrivedInRoom(roomId);
        });
        this.uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.hideInventory();
        });
        this.uiEventEmitter.on('item_moved_to_room_layer', () => {
            this.drawInventoryLayer();
        });
        this.uiEventEmitter.on('dragmove_hover_on_object', ({ target, draggedItem: _draggedItem, targetName: _targetName }) => {
            this.handleDragMoveHoverOnObject(target);
        });
        this.uiEventEmitter.on('dragmove_hover_on_nothing', () => {
            this.handleDragMoveHoverOnNothing();
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
        this.inventoryItemsView.resetItems();
        this.inventoryItemsView.handleInventoryItemVisibility(visibleInventoryItems);
        this.inventoryArrowsView.toggleArrowVisibility(isInventoryLeftArrowVisible, isInventoryRightArrowVisible);
        this.inventoryItemsView.clearInventoryItemBlur();
        this.drawInventoryLayer();
        this.uiEventEmitter.emit('inventory_redrawn');
    }

    showInventory() {
        this.inventoryBarLayer.show();
        this.inventoryItemsView.show();
        this.inventoryArrowsView.show();
        this.drawInventoryLayer();
    }

    hideInventory() {
        this.inventoryItemsView.hide();
        this.inventoryArrowsView.hide();
        this.inventoryBarLayer.hide();
    }

    drawInventoryLayer() {
        this.inventoryItemsView.draw();
        this.inventoryArrowsView.draw();
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
