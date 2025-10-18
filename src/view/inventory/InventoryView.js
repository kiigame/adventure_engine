import EventEmitter from "../../events/EventEmitter.js";
import StageObjectGetter from "../stage/StageObjectGetter.js";

class InventoryView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {StageObjectGetter} stageObjectGetter
     * @param {Konva.Group} inventoryItems
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
        // List of items in the inventory. inventoryList.length gives the item amount.
        this.inventoryList = [];
        // How many items the inventory can show at a time (7 with current settings)
        this.inventoryMax = 7;
        // The item number where the shown items start from (how many items from the beginning are not shown)
        this.inventoryIndex = 0;

        this.gameEventEmitter.on('inventory_add', (itemName) => {
            this.inventoryAdd(itemName);
        });
        this.gameEventEmitter.on('inventory_remove', (itemName) => {
            this.inventoryRemove(itemName);
        });
        this.gameEventEmitter.on('arrived_in_room', (roomId) => {
            // Slightly kludgy way of checking if we want to show inventory
            if (this.stageObjectGetter.getObject(roomId).attrs.fullScreen) {
                return;
            }
            this.showInventory();
        });
        this.uiEventEmitter.on('dragend_ended', () => {
            this.clearInventoryItemBlur();
            this.redrawInventory();
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
            this.handleInventoryLeftArrowEngaged();
        });
        this.uiEventEmitter.on('inventory_right_arrow_draghovered', () => {
            this.handleInventoryRightArrowEngaged();
        });
        this.uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.hideInventory();
        });
        this.uiEventEmitter.on('item_moved_to_room_layer', () => {
            this.drawInventoryLayer();
        });
        // Handle clicks etc on inventory items and arrows
        this.inventoryItems.on('click tap', (event) => {
            this.uiEventEmitter.emit('inventory_click', event.target);
        });
        this.stageObjectGetter.getObject('inventory_left_arrow').on('click tap', () => {
            this.handleInventoryLeftArrowEngaged();
        });
        this.stageObjectGetter.getObject('inventory_right_arrow').on('click tap', () => {
            this.handleInventoryRightArrowEngaged();
        });
        this.inventoryItems.on('touchstart mousedown', (event) => {
            this.uiEventEmitter.emit('inventory_touchstart', event.target);
        });
    }

    /**
     * Adding an item to the inventory. Adds new items, but also an item that
     * has been dragged out of the inventory is put back with this function.
     * May become problematic if interaction both returns the dragged item
     * and adds a new one.
     *
     * @param {string} itemNameAdded The name of the item added to the inventory.
     */
    inventoryAdd(itemNameAdded) {
        const item = this.stageObjectGetter.getObject(itemNameAdded);
        item.show();
        item.moveTo(this.inventoryItems);
        item.clearCache();
        item.size({ width: 80, height: 80 });

        if (this.inventoryList.indexOf(item) > -1) {
            this.inventoryList.splice(this.inventoryList.indexOf(item), 1, item);
        } else {
            this.inventoryList.push(item);
        }

        // The picked up item should be visible in the inventory. Scroll inventory to the right if necessary.
        if (this.inventoryList.indexOf(item) > this.inventoryIndex + this.inventoryMax - 1) {
            this.inventoryIndex = Math.max(this.inventoryList.indexOf(item) + 1 - this.inventoryMax, 0);
        }

        this.redrawInventory();
    }

    /**
     * Removing an item from the inventory.
     *
     * @param {string} itemNameRemoved Name of the item removed from the inventory
     */
    inventoryRemove(itemNameRemoved) {
        const itemRemoved = this.stageObjectGetter.getObject(itemNameRemoved);
        itemRemoved.hide();
        this.inventoryList = this.inventoryList.filter((item) => itemRemoved !== item);
        this.redrawInventory();
    }

    handleInventoryLeftArrowEngaged() {
        this.inventoryIndex--;
        this.redrawInventory();
    }

    handleInventoryRightArrowEngaged() {
        this.inventoryIndex++;
        this.redrawInventory();
    };

    /**
     * Manages which inventory items are shown. There's limited space in the UI,
     * and we may have an arbitrary number of items in the inventory. Shows the
     * items that should be visible according to inventory_index and takes care
     * of showing inventory arrows as necessary.
     */
    redrawInventory() {
        // At first reset all items. Adding or removing items, as well as clicking
        // arrows, may change which items should be shown.
        this.inventoryItems.getChildren().each((shape, i) => {
            shape.setAttr('visible', false);
        });

        // If the left arrow is visible AND there's empty space to the right,
        // scroll the inventory to the left. This should happen when removing items.
        if (this.inventoryIndex + this.inventoryMax > this.inventoryList.length) {
            this.inventoryIndex = Math.max(this.inventoryList.length - this.inventoryMax, 0);
        }

        for (let i = this.inventoryIndex; i < Math.min(this.inventoryIndex + this.inventoryMax, this.inventoryList.length); i++) {
            const shape = this.inventoryList[i];
            shape.x(this.offsetFromLeft + (this.inventoryList.indexOf(shape) - this.inventoryIndex) * 100);
            shape.y(this.offsetFromTop);
            shape.setAttr('visible', true);
        }

        if (this.inventoryIndex > 0) {
            this.stageObjectGetter.getObject("inventory_left_arrow").show();
        } else {
            this.stageObjectGetter.getObject("inventory_left_arrow").hide();
        }

        if (this.inventoryIndex + this.inventoryMax < this.inventoryList.length) {
            this.stageObjectGetter.getObject("inventory_right_arrow").show();
        } else {
            this.stageObjectGetter.getObject("inventory_right_arrow").hide();
        }

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
        this.inventoryItems.getChildren().each((shape, _i) => {
            shape.shadowBlur(0);
        });
    }

    glowInventoryItem(target) {
        // check that target is in inventory
        if (!this.inventoryList.find((item) => item === target)) {
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
}

export default InventoryView;
