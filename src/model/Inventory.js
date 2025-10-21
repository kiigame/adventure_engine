import EventEmitter from "../events/EventEmitter.js";

class Inventory {
    /**
     * @param {EventEmitter} gameEventEmitter
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(gameEventEmitter, uiEventEmitter) {
        this.gameEventEmitter = gameEventEmitter;
        this.uiEventEmitter = uiEventEmitter;
        this.items = []; // Object { name, category }[]
        this.gameEventEmitter.on('inventory_add', ({ name, category }) => {
            this.inventoryAdd(name, category);
        });
        this.gameEventEmitter.on('inventory_remove', (name) => {
            this.inventoryRemove(name);
        });
    }

    /**
     * @param {string} name
     * @param {string} category category/type of the inventory item
     */
    inventoryAdd(name, category) {
        this.items.push({ name, category });
        this.gameEventEmitter.emit('inventory_item_added', { itemList: this.items, itemNameAdded: name });
    }

    /**
     * @param {string} name
     */
    inventoryRemove(name) {
        this.items = this.items.filter((item) => name !== item.name);
        this.gameEventEmitter.emit('inventory_item_removed', { itemList: this.items, itemNameRemoved: name });
    }
}

export default Inventory;
