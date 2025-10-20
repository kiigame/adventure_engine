import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import Inventory from './Inventory.js';
import EventEmitter from '../events/EventEmitter.js';

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
            inventoryAddCallback('item');
            expect(gameEventEmitterStub.emit, 'inventory_item_added not emitted as expected').to.have.been.calledWith(
                'inventory_item_added',
                { itemList: ['item'], itemNameAdded: 'item' }
            );
        });
        it('should add new item to existing inventory and it should be at the end', () => {
            const inventory = new Inventory(gameEventEmitterStub, uiEventEmitterStub);
            const inventoryAddCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_add';
            }).args[1];
            inventory.items = ['old_item']
            inventoryAddCallback('new_item');
            expect(gameEventEmitterStub.emit, 'inventory_item_added not emitted as expected').to.have.been.calledWith(
                'inventory_item_added',
                { itemList: ['old_item', 'new_item'], itemNameAdded: 'new_item' }
            );
        });
    });
    describe('remove items from inventory', () => {
        it('should remove item from inventory and the rest of the inventory should be in same order and have no gaps', () => {
            const inventory = new Inventory(gameEventEmitterStub, uiEventEmitterStub);
            const inventoryRemoveCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_remove';
            }).args[1];
            inventory.items = ['first_item', 'item_to_remove', 'last_item'];
            inventoryRemoveCallback('item_to_remove');
            expect(gameEventEmitterStub.emit, 'inventory_item_removed not emitted as expected').calledWith(
                'inventory_item_removed',
                { itemList: ['first_item', 'last_item'], itemNameRemoved: 'item_to_remove' }
            );
        });
    });
});
