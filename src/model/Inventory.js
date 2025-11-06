import { EventEmitter } from "../events/EventEmitter.js";

class Inventory {
    /**
     * @param {EventEmitter} gameEventEmitter
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(gameEventEmitter, uiEventEmitter) {
        this.gameEventEmitter = gameEventEmitter;
        this.uiEventEmitter = uiEventEmitter;
        this.items = []; // Object { name, category }[]
        this.gameEventEmitter.on('inventory_add', (items) => {
            this.inventoryAdd(items);
        });
        this.gameEventEmitter.on('inventory_remove', (names) => {
            this.inventoryRemove(names);
        });
    }

    /**
     * @param {object[]} items Object { name: string, category: string }[]
     */
    inventoryAdd(items) {
        items.forEach((item) => {
            if (!this.items.find((existingItem) => existingItem.name === item.name)) {
                this.items.push(item);
            }
        });
        const itemNamesAdded = []
        items.forEach((item) => {
            itemNamesAdded.push(item.name);
        });
        this.gameEventEmitter.emit('inventory_items_added', { itemList: this.items, itemNamesAdded });
    }

    /**
     * @param {string[]} names
     */
    inventoryRemove(names) {
        names.forEach((name) => {
            this.items = this.items.filter((item) => name !== item.name);
        });
        this.gameEventEmitter.emit('inventory_items_removed', { itemList: this.items });
    }
}

export default Inventory;
