import EventEmitter from "../events/EventEmitter.js";

class Inventory {
    /**
     * @param {EventEmitter} gameEventEmitter
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(gameEventEmitter, uiEventEmitter) {
        this.gameEventEmitter = gameEventEmitter;
        this.uiEventEmitter = uiEventEmitter;
        this.items = []; // string[]
        this.gameEventEmitter.on('inventory_add', (itemName) => {
            this.inventoryAdd(itemName);
        });
        this.gameEventEmitter.on('inventory_remove', (itemName) => {
            this.inventoryRemove(itemName);
        });
    }

    /**
     * @param {string} itemName
     */
    inventoryAdd(itemName) {
        this.items.push(itemName);
        this.gameEventEmitter.emit('inventory_item_added', { itemList: this.items, itemNameAdded: itemName });
    }

    /**
     * @param {string} itemNameToRemove
     */
    inventoryRemove(itemNameToRemove) {
        this.items = this.items.filter((item) => itemNameToRemove !== item);
        this.gameEventEmitter.emit('inventory_item_removed', { itemList: this.items, itemNameRemoved: itemNameToRemove });
    }
}

export default Inventory;
