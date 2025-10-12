class InventoryView {
    constructor(uiEventEmitter, gameEventEmitter, stageObjectGetter, inventoryLayer, inventoryBarLayer, offsetFromTop) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.stageObjectGetter = stageObjectGetter;
        this.inventoryLayer = inventoryLayer;
        this.inventoryBarLayer = inventoryBarLayer;
        // Offset from top for drawing inventory items starting from proper position
        this.offsetFromTop = offsetFromTop;
        // Offset from left for drawing inventory items starting from proper position
        this.offsetFromLeft = 50;
        // List of items in the inventory. inventory_list.length gives the item amount.
        this.inventory_list = [];
        // How many items the inventory can show at a time (7 with current settings)
        this.inventory_max = 7;
        // The item number where the shown items start from (how many items from the beginning are not shown)
        this.inventory_index = 0;

        this.gameEventEmitter.on('inventory_add', (itemName) => {
            this.inventoryAdd(itemName);
        });
        this.gameEventEmitter.on('inventory_remove', (itemName) => {
            this.inventoryRemove(itemName);
        });
        this.uiEventEmitter.on('dragend_ended', () => {
            this.redrawInventory();
        });
        this.uiEventEmitter.on('inventory_left_arrow_draghovered', () => {
            this.handleInventoryLeftArrowEngaged();
        });
        this.uiEventEmitter.on('inventory_right_arrow_draghovered', () => {
            this.handleInventoryRightArrowEngaged();
        });
        this.gameEventEmitter.on('arrived_in_room', (roomId) => {
            // Slightly kludgy way of checking if we want to show inventory
            if (this.stageObjectGetter.getObject(roomId).attrs.fullScreen) {
                return;
            }
            this.showInventory();
        });
        this.uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.hideInventory();
        });
        this.uiEventEmitter.on('item_moved_to_room_layer', () => {
            this.drawInventoryLayers();
        });
        // Handle clicks on inventory items
        this.inventoryLayer.on('click tap', (event) => {
            this.uiEventEmitter.emit('inventory_click', event.target);
        });
        this.stageObjectGetter.getObject('inventory_left_arrow').on('click tap', () => {
            this.handleInventoryLeftArrowEngaged();
        });
        this.stageObjectGetter.getObject('inventory_right_arrow').on('click tap', () => {
            this.handleInventoryRightArrowEngaged();
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
        item.moveTo(this.inventoryLayer);
        item.clearCache();
        item.size({ width: 80, height: 80 });

        if (this.inventory_list.indexOf(item) > -1) {
            this.inventory_list.splice(this.inventory_list.indexOf(item), 1, item);
        } else {
            this.inventory_list.push(item);
        }

        // The picked up item should be visible in the inventory. Scroll inventory to the right if necessary.
        if (this.inventory_list.indexOf(item) > this.inventory_index + this.inventory_max - 1) {
            this.inventory_index = Math.max(this.inventory_list.indexOf(item) + 1 - this.inventory_max, 0);
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
        this.inventory_list = this.inventory_list.filter((item) => itemRemoved !== item);
        this.redrawInventory();
    }

    handleInventoryLeftArrowEngaged() {
        this.inventory_index--;
        this.redrawInventory();
    }

    handleInventoryRightArrowEngaged() {
        this.inventory_index++;
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
        this.inventoryLayer.getChildren().each((shape, i) => {
            shape.setAttr('visible', false);
        });

        // If the left arrow is visible AND there's empty space to the right,
        // scroll the inventory to the left. This should happen when removing items.
        if (this.inventory_index + this.inventory_max > this.inventory_list.length) {
            this.inventory_index = Math.max(this.inventory_list.length - this.inventory_max, 0);
        }

        for (let i = this.inventory_index; i < Math.min(this.inventory_index + this.inventory_max, this.inventory_list.length); i++) {
            const shape = this.inventory_list[i];
            shape.x(this.offsetFromLeft + (this.inventory_list.indexOf(shape) - this.inventory_index) * 100);
            shape.y(this.offsetFromTop);
            shape.setAttr('visible', true);
        }

        if (this.inventory_index > 0) {
            this.stageObjectGetter.getObject("inventory_left_arrow").show();
        } else {
            this.stageObjectGetter.getObject("inventory_left_arrow").hide();
        }

        if (this.inventory_index + this.inventory_max < this.inventory_list.length) {
            this.stageObjectGetter.getObject("inventory_right_arrow").show();
        } else {
            this.stageObjectGetter.getObject("inventory_right_arrow").hide();
        }

        this.drawInventoryLayers();
        this.uiEventEmitter.emit('inventory_redrawn');
    }

    showInventory() {
        this.inventoryLayer.show();
        this.inventoryBarLayer.show();
        this.drawInventoryLayers();
    }

    hideInventory() {
        this.inventoryLayer.hide();
        this.inventoryBarLayer.hide();
    }

    drawInventoryLayers() {
        this.inventoryBarLayer.draw();
        this.inventoryLayer.draw();
    }
}

export default InventoryView;
