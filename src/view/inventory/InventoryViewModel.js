import EventEmitter from "../../events/EventEmitter.js";

class InventoryViewModel {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {int} inventoryMax How many items the inventory can show at a time
     */
    constructor(uiEventEmitter, gameEventEmitter, inventoryMax) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.inventoryMax = inventoryMax;

        // List of items in the inventory. inventoryList.length gives the item amount.
        this.inventoryList = []; // string[], just the names
        // The item number where the shown items start from (how many items from the beginning are not shown)
        this.inventoryIndex = 0;

        this.gameEventEmitter.on('inventory_item_added', ({ itemList, itemNameAdded }) => {
            this.handleInventoryItemAdded(itemList, itemNameAdded);
        });
        this.gameEventEmitter.on('inventory_item_removed', ({ itemList, itemNameRemoved: _itemNameRemoved }) => {
            this.handleInventoryItemRemoved(itemList);
        });
        this.uiEventEmitter.on('inventory_left_arrow_engaged', () => {
            this.handleInventoryLeftArrowEngaged();
        });
        this.uiEventEmitter.on('inventory_right_arrow_engaged', () => {
            this.handleInventoryRightArrowEngaged();
        });
        this.uiEventEmitter.on('dragend_ended', (draggedItem) => {
            this.handleDragEnd(draggedItem);
        });
    }

    scrollInventoryToItem (itemName) {
        if (this.inventoryList.indexOf(itemName) > this.inventoryIndex + this.inventoryMax - 1) {
            this.inventoryIndex = Math.max(this.inventoryList.indexOf(itemName) + 1 - this.inventoryMax, 0);
        }
    }

    /**
     * Handle item having been added to the inventory. Updates which items should be visible in UI.
     *
     * @param {string[]} itemList Current inventory model status (list of items in inventory, names)
     * @param {string} itemNameAdded The name of the item added to the inventory.
     */
    handleInventoryItemAdded(itemList, itemNameAdded) {
        this.inventoryList = itemList;

        if (this.inventoryList.indexOf(itemNameAdded) > -1) {
            this.inventoryList.splice(this.inventoryList.indexOf(itemNameAdded), 1, itemNameAdded);
        } else {
            this.inventoryList.push(itemNameAdded);
        }
        // The picked up item should be visible in the inventory. Scroll inventory to the right if necessary.
        this.scrollInventoryToItem(itemNameAdded);

        this.calculateVisibleItems();
    }

    /**
     * Handles item having been removed from the inventory. Updates which items should be visible in the UI.
     *
     * @param {string[]} itemList
     */
    handleInventoryItemRemoved(itemList) {
        this.inventoryList = itemList;

        // If there's empty room on the right, move index to the left
        if (this.inventoryIndex + this.inventoryMax > this.inventoryList.length) {
            this.inventoryIndex = Math.max(this.inventoryList.length - this.inventoryMax, 0);
        }

        this.calculateVisibleItems();
    }

    handleInventoryLeftArrowEngaged() {
        this.inventoryIndex--;
        this.calculateVisibleItems();
    }

    handleInventoryRightArrowEngaged() {
        this.inventoryIndex++;
        this.calculateVisibleItems();
    };

    handleDragEnd(draggedItem) {
        if (draggedItem) {
            this.scrollInventoryToItem(draggedItem.attrs.id);
        }
        this.calculateVisibleItems();
    }

    calculateVisibleItems() {
        const visibleInventoryItems = [];
        for (let i = this.inventoryIndex; i < this.inventoryIndex + this.inventoryMax && i < (this.inventoryList.length); i++) {
            visibleInventoryItems.push(this.inventoryList[i]);
        }
        this.uiEventEmitter.emit('inventory_view_model_updated', {
            visibleInventoryItems,
            isLeftArrowVisible: this.isLeftAwrrowVisible(),
            isRightArrowVisible: this.isRightArrowVisible()
        });
    }

    isLeftAwrrowVisible() {
        return this.inventoryIndex > 0;
    }

    isRightArrowVisible() {
        return this.inventoryIndex + this.inventoryMax < this.inventoryList.length;
    }
}

export default InventoryViewModel;
