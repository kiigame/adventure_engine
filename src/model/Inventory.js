class Inventory {
    constructor(gameEventEmitter, uiEventEmitter) {
        this.gameEventEmitter = gameEventEmitter;
        this.uiEventEmitter = uiEventEmitter;
        this.items = [];
        this.gameEventEmitter.on('inventory_add', (itemName) => {
            this.inventoryAdd(itemName);
        });
        this.gameEventEmitter.on('inventory_remove', (itemName) => {
            this.inventoryRemove(itemName);
        });
    }

    inventoryAdd(itemName) {
        if (this.items.indexOf(itemName) > -1) {
            this.items.splice(this.items.indexOf(itemName), 1, itemName);
        } else {
            this.items.push(itemName);
        }
        this.gameEventEmitter.emit('inventory_item_added', { inventoryList: this.items, itemNameAdded: itemName });
    }

    inventoryRemove(itemNameToRemove) {
        this.items = this.items.filter((item) => itemNameToRemove !== item);
        this.gameEventEmitter.emit('inventory_item_removed', { inventoryList: this.items, itemNameRemoved: itemNameToRemove });
    }
}

export default Inventory;
