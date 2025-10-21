import { expect, use } from 'chai';
import { createStubInstance } from 'sinon';
import sinonChai from "sinon-chai";
import Inventory from './Inventory.js';
import EventEmitter from '../events/EventEmitter.js';
use(sinonChai);

describe('Inventory model tests', () => {
    let gameEventEmitterStub;
    let uiEventEmitterStub;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter);
        uiEventEmitterStub = createStubInstance(EventEmitter);
    });
    describe('add items to inventory', () => {
        it('should add new item to empty inventory and it should be the only item', () => {
            new Inventory(gameEventEmitterStub, uiEventEmitterStub);
            const inventoryAddCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_add';
            }).args[1];
            inventoryAddCallback([{ name: 'item', category: 'item' }]);
            expect(gameEventEmitterStub.emit, 'inventory_items_added not emitted as expected').to.have.been.calledWith(
                'inventory_items_added',
                { itemList: [{ name: 'item', category: 'item' }], itemNamesAdded: ['item'] }
            );
        });
        it('should add new item to existing inventory and it should be at the end', () => {
            const inventory = new Inventory(gameEventEmitterStub, uiEventEmitterStub);
            const inventoryAddCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_add';
            }).args[1];
            inventory.items = [{ name: 'old_item', category: 'item' }];
            inventoryAddCallback([{ name: 'new_item', category: 'item' }]);
            expect(gameEventEmitterStub.emit, 'inventory_items_added not emitted as expected').to.have.been.calledWith(
                'inventory_items_added',
                { itemList: [{ name: 'old_item', category: 'item' }, { name: 'new_item', category: 'item' }], itemNamesAdded: ['new_item'] }
            );
        });
        it('should add multiple new items to an existing inventory and they should be at the end', () => {
            const inventory = new Inventory(gameEventEmitterStub, uiEventEmitterStub);
            const inventoryAddCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_add';
            }).args[1];
            inventory.items = [{ name: 'old_item', category: 'item' }];
            inventoryAddCallback([{ name: 'new_item', category: 'item' }, { name: 'even_newer_item', category: 'item' }]);
            expect(gameEventEmitterStub.emit, 'inventory_items_added not emitted as expected').to.have.been.calledWith(
                'inventory_items_added',
                {
                    itemList: [
                        { name: 'old_item', category: 'item' },
                        { name: 'new_item', category: 'item' },
                        { name: 'even_newer_item', category: 'item' }
                    ], itemNamesAdded: [
                        'new_item',
                        'even_newer_item'
                    ]
                }
            );
        });
        it('should not duplicate existing items in inventory if they are added again', () => {
            const inventory = new Inventory(gameEventEmitterStub, uiEventEmitterStub);
            const inventoryAddCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_add';
            }).args[1];
            inventory.items = [{ name: 'old_item', category: 'item' }];
            inventoryAddCallback([{ name: 'old_item', category: 'item' }]);
            expect(gameEventEmitterStub.emit, 'inventory_items_added not emitted as expected').to.have.been.calledWith(
                'inventory_items_added',
                { itemList: [{ name: 'old_item', category: 'item' }], itemNamesAdded: ['old_item'] }
            );
        });
    });
    describe('remove items from inventory', () => {
        it('should remove item from inventory and the rest of the inventory should be in same order and have no gaps', () => {
            const inventory = new Inventory(gameEventEmitterStub, uiEventEmitterStub);
            const inventoryRemoveCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_remove';
            }).args[1];
            inventory.items = [
                { name: 'first_item', category: 'item' },
                { name: 'item_to_remove', category: 'item' },
                { name: 'last_item', category: 'item' }
            ];
            inventoryRemoveCallback(['item_to_remove']);
            expect(gameEventEmitterStub.emit, 'inventory_items_removed not emitted as expected').calledWith(
                'inventory_items_removed',
                {
                    itemList: [
                        { name: 'first_item', category: 'item' },
                        { name: 'last_item', category: 'item' }
                    ]
                }
            );
        });
        it('should remove multiple items from inventory and the rest of the inventory should be in same order and have no gaps', () => {
            const inventory = new Inventory(gameEventEmitterStub, uiEventEmitterStub);
            const inventoryRemoveCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_remove';
            }).args[1];
            inventory.items = [
                { name: 'first_item', category: 'item' },
                { name: 'item_to_remove_from_the_middle', category: 'item' },
                { name: 'last_remaining_item', category: 'item' },
                { name: 'item_to_remove_from_the_end', category: 'item' }
            ];
            inventoryRemoveCallback(['item_to_remove_from_the_middle', 'item_to_remove_from_the_end']);
            expect(gameEventEmitterStub.emit, 'inventory_items_removed not emitted as expected').calledWith(
                'inventory_items_removed',
                {
                    itemList: [
                        { name: 'first_item', category: 'item' },
                        { name: 'last_remaining_item', category: 'item' }
                    ]
                }
            );
        });

    });
});
