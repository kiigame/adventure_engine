import { EventEmitter } from "@kiigame/kgae_ts";

export class Inventory {
  private gameEventEmitter: EventEmitter;
  private items: { name: string, category: string }[];

  constructor(gameEventEmitter: EventEmitter, items: { name: string, category: string }[] = []) {
    this.gameEventEmitter = gameEventEmitter;
    this.items = items;
    this.gameEventEmitter.on('inventory_add', (items: { name: string, category: string }[]) => {
      this.inventoryAdd(items);
    });
    this.gameEventEmitter.on('inventory_remove', (names: string[]) => {
      this.inventoryRemove(names);
    });
  }

  inventoryAdd(items: { name: string, category: string }[]) {
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

  getItems(): { name: string, category: string }[] {
    return this.items;
  }
}
