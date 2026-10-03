import { EventEmitter } from "@kiigame/kgae_ts";

export interface InventoryItem {
  name: string,
  category: string,
};

export class Inventory {
  private gameEventEmitter: EventEmitter;
  private items: InventoryItem[];

  constructor(gameEventEmitter: EventEmitter, items: InventoryItem[] = []) {
    this.gameEventEmitter = gameEventEmitter;
    this.items = items;
    this.gameEventEmitter.on('inventory_add', (items: InventoryItem[]) => {
      this.inventoryAdd(items);
    });
    this.gameEventEmitter.on('inventory_remove', (names: string[]) => {
      this.inventoryRemove(names);
    });
  }

  inventoryAdd(items: InventoryItem[]) {
    items.forEach((item) => {
      if (!this.items.find((existingItem) => existingItem.name === item.name)) {
        this.items.push(item);
      }
    });
    const itemNamesAdded: string[] = []
    items.forEach((item) => {
      itemNamesAdded.push(item.name);
    });
    this.gameEventEmitter.emit('inventory_items_added', { itemList: this.items, itemNamesAdded });
  }

  inventoryRemove(names: string[]) {
    names.forEach((name) => {
      this.items = this.items.filter((item) => name !== item.name);
    });
    this.gameEventEmitter.emit('inventory_items_removed', { itemList: this.items });
  }

  getItems(): InventoryItem[] {
    return this.items;
  }
}
