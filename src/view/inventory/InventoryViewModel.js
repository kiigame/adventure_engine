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

        this.gameEventEmitter.on('inventory_items_added', ({ itemList, itemNamesAdded }) => {
            this.handleInventoryItemsAdded(itemList, itemNamesAdded);
        });
        this.gameEventEmitter.on('inventory_items_removed', ({ itemList }) => {
            this.handleInventoryItemsRemoved(itemList);
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

    scrollInventoryToItem(itemName) {
        if (this.inventoryList.indexOf(itemName) > this.inventoryIndex + this.inventoryMax - 1) {
            this.inventoryIndex = Math.max(this.inventoryList.indexOf(itemName) + 1 - this.inventoryMax, 0);
        }
    }

    /**
     * @param {object[]} modelItemList Object { name, category }
     * @returns {string[]} the viewModelItemList
     */
    modelItemListToViewModelItemList(modelItemList) {
        const viewModelItemList = [];
        modelItemList.forEach((modelItem) => {
            viewModelItemList.push(modelItem.name);
        });
        return viewModelItemList;
    }

    /**
     * Handle item having been added to the inventory. Updates which items should be visible in UI.
     *
     * @param {string[]} itemList Current inventory model status (list of items in inventory, Object { name, category })
     * @param {string[]} itemNamesAdded The names of the items added to the inventory.
     */
    handleInventoryItemsAdded(itemList, itemNamesAdded) {
        this.inventoryList = this.modelItemListToViewModelItemList(itemList);

        // The last picked up item should be visible in the inventory. Scroll inventory to the right if necessary.
        this.scrollInventoryToItem(itemNamesAdded.at(-1));

        this.calculateVisibleItems();
    }

    /**
     * Handles item having been removed from the inventory. Updates which items should be visible in the UI.
     *
     * @param {string[]} itemList
     */
    handleInventoryItemsRemoved(itemList) {
        this.inventoryList = this.modelItemListToViewModelItemList(itemList);

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
