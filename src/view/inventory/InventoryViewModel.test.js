import { expect, use } from 'chai';
import { createStubInstance, restore } from 'sinon';
import sinonChai from "sinon-chai";
import InventoryViewModel from './InventoryViewModel.js';
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
const { Shape } = pkg;
use(sinonChai);

describe('inventory view model tests', () => {
    let gameEventEmitterStub;
    let uiEventEmitterStub;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter);
        uiEventEmitterStub = createStubInstance(EventEmitter);
    });
    afterEach(() => {
        restore();
    });
    describe('add inventory item', () => {
        it('should emit visible items and arrows when receiving inventory_item_added event', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['really_nice_item'];
            const inventoryItemAddedCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_added';
            }).args[1];
            const itemList = [{ name: 'really_nice_item', category: 'item' }, { name: 'even_better_item', category: 'item' }];
            const itemNameAdded = 'even_better_item';
            inventoryItemAddedCallback({ itemList, itemNameAdded });
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['really_nice_item', 'even_better_item'],
                    isLeftArrowVisible: false,
                    isRightArrowVisible: false
                }
            );
        });
        it('should show left arrow and latest item when adding item and inventory size is larger than max', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
            const inventoryItemAddedCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_added';
            }).args[1];
            const itemList = [
                { name: 'one', category: 'item' },
                { name: 'two', category: 'item' },
                { name: 'three', category: 'item' },
                { name: 'four', category: 'item' },
                { name: 'five', category: 'item' },
                { name: 'six', category: 'item' },
                { name: 'seven', category: 'item' },
                { name: 'EIGHT', category: 'item' }
            ];
            const itemNameAdded = 'EIGHT';
            inventoryItemAddedCallback({ itemList, itemNameAdded });
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['two', 'three', 'four', 'five', 'six', 'seven', 'EIGHT'],
                    isLeftArrowVisible: true,
                    isRightArrowVisible: false
                }
            );
        });
    });
    describe('add item back to inventory view model on drag end', () => {
        it('should tell view to redraw inventory on drag end', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'FOUR', 'five', 'six', 'seven', 'eight'];
            inventoryViewModel.inventoryIndex = 1;
            const dragendEndedHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend_ended';
            }).args[1];
            const draggedItemMock = createStubInstance(Shape);
            draggedItemMock.attrs = { id: 'FOUR' };
            dragendEndedHandler(draggedItemMock);
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['two', 'three', 'FOUR', 'five', 'six', 'seven', 'eight'],
                    isLeftArrowVisible: true,
                    isRightArrowVisible: false
                }
            );
        });
        it('should scroll inventory back to the dragged item if view no longer contains the dragged item', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'EIGHT'];
            inventoryViewModel.inventoryIndex = 0;
            const dragendEndedHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend_ended';
            }).args[1];
            const draggedItemMock = createStubInstance(Shape);
            draggedItemMock.attrs = { id: 'EIGHT' };
            dragendEndedHandler(draggedItemMock);
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['two', 'three', 'four', 'five', 'six', 'seven', 'EIGHT'],
                    isLeftArrowVisible: true,
                    isRightArrowVisible: false
                }
            );
        });
        it('should not update index if the dragged item no longer exists (was removed)', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
            inventoryViewModel.inventoryIndex = 0;
            const dragendEndedHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend_ended';
            }).args[1];
            const draggedItemMock = null;
            dragendEndedHandler(draggedItemMock);
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'],
                    isLeftArrowVisible: false,
                    isRightArrowVisible: false
                }
            );
        });
    });
    describe('remove inventory item', () => {
        it('should emit visible items and arrows when receiving inventory_item_removed event', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['really_nice_item', 'even_better_item'];
            const inventoryItemRemovedCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_removed';
            }).args[1];
            const itemList = [{ name: 'really_nice_item', category: 'item' }];
            const itemNameRemoved = 'even_better_item';
            inventoryItemRemovedCallback({ itemList, itemNameRemoved });
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['really_nice_item'],
                    isLeftArrowVisible: false,
                    isRightArrowVisible: false
                }
            );
        });
        it('should not show empty space on the right when removing items if number of items is still equal to max or more', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'four', 'FIVE', 'six', 'seven', 'eight', 'nine'];
            inventoryViewModel.inventoryIndex = 2;
            const inventoryItemRemovedCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_removed';
            }).args[1];
            const itemList = [
                { name: 'one', category: 'item' },
                { name: 'two', category: 'item' },
                { name: 'three', category: 'item' },
                { name: 'four', category: 'item' },
                { name: 'six', category: 'item' },
                { name: 'seven', category: 'item' },
                { name: 'eight', category: 'item' },
                { name: 'nine', category: 'item' }
            ];
            const itemNameRemoved = 'FIVE';
            inventoryItemRemovedCallback({ itemList, itemNameRemoved: itemNameRemoved });
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['two', 'three', 'four', 'six', 'seven', 'eight', 'nine'],
                    isLeftArrowVisible: true,
                    isRightArrowVisible: false
                }
            );
        });
    });
    describe('inventory left arrow engaged', () => {
        it('should show only right inventory arrow if index is reduced from 1 -> 0 with a large inventory', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
            inventoryViewModel.inventoryIndex = 1;
            const inventoryLeftArrowEngagedCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_left_arrow_engaged';
            }).args[1];
            inventoryLeftArrowEngagedCallback();
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['one', 'two', 'three', 'four', 'five', 'six', 'seven'],
                    isLeftArrowVisible: false,
                    isRightArrowVisible: true
                }
            );
        });
        it('should show both inventory arrows if index is reduced from 2 -> 1 with a large inventory', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
            inventoryViewModel.inventoryIndex = 2;
            const inventoryLeftArrowEngagedCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_left_arrow_engaged';
            }).args[1];
            inventoryLeftArrowEngagedCallback();
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['two', 'three', 'four', 'five', 'six', 'seven', 'eight'],
                    isLeftArrowVisible: true,
                    isRightArrowVisible: true
                }
            );
        });
    });
    describe('inventory right arrow engaged', () => {
        it('should show only left inventory arrow if index is increased from 1 -> 2 with a large inventory', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
            inventoryViewModel.inventoryIndex = 1;
            const inventoryRightArrowEngagedCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_right_arrow_engaged';
            }).args[1];
            inventoryRightArrowEngagedCallback();
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
                    isLeftArrowVisible: true,
                    isRightArrowVisible: false
                }
            );
        });
        it('should show both inventory arrows if index is increased from 0 -> 1 with a large inventory', () => {
            const inventoryViewModel = new InventoryViewModel(uiEventEmitterStub, gameEventEmitterStub, 7);
            inventoryViewModel.inventoryList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
            inventoryViewModel.inventoryIndex = 0;
            const inventoryRightArrowEngagedCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_right_arrow_engaged';
            }).args[1];
            inventoryRightArrowEngagedCallback();
            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_view_model_updated',
                {
                    visibleInventoryItems: ['two', 'three', 'four', 'five', 'six', 'seven', 'eight'],
                    isLeftArrowVisible: true,
                    isRightArrowVisible: true
                }
            );
        });
    });
});
