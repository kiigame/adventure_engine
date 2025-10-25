import { expect, use } from 'chai';
import { createStubInstance, restore, assert } from 'sinon';
import sinonChai from "sinon-chai";
import EventEmitter from '../../events/EventEmitter.js';
import InventoryItemsView from './InventoryItemsView.js';
import pkg from 'konva';
const { Shape, Group, Collection } = pkg;
use(sinonChai);

describe('inventory item view tests', () => {
    let gameEventEmitterStub;
    let uiEventEmitterStub;
    let inventoryItemsGroupStub;
    let inventoryItemsCollectionStub;
    let inventoryItemStub;
    let inventoryItemStubs;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        gameEventEmitterStub = createStubInstance(EventEmitter);
        inventoryItemStub = createStubInstance(Shape);
        inventoryItemStubs = [inventoryItemStub];
        inventoryItemsCollectionStub = createStubInstance(Collection);
        inventoryItemsCollectionStub.each.yields(inventoryItemStub);
        inventoryItemsGroupStub = createStubInstance(Group, {
            getChildren: inventoryItemsCollectionStub,
            find: inventoryItemStub
        });
        inventoryItemsGroupStub.findOne.yields(inventoryItemStub).returns(inventoryItemStub);
    });
    afterEach(() => {
        restore();
    });
    describe('reset inventory items', () => {
        // Don't know how to stub multiple shapes in the collection!
        it('should set Shapes in the inventory items group to not visible', () => {
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            inventoryItemsView.resetItems();
            expect(inventoryItemStub.setAttr).to.have.been.calledWith('visible', false);
        });
    });
    describe('handle inventory item visibilty', () => {
        it('should set existing item in the inventory visible', () => {
            inventoryItemStub.attrs = { id: 'blabla' };
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            inventoryItemsView.handleInventoryItemVisibility(['blabla']);
            expect(inventoryItemStub.x).to.have.been.calledWith(50);
            expect(inventoryItemStub.y).to.have.been.calledWith(100);
            expect(inventoryItemStub.setAttr).to.have.been.calledWith('visible', true);
        });
        it('should set multiple inventory items\' y coordinates correctly', () => {
            inventoryItemStubs = [
                createStubInstance(Shape),
                createStubInstance(Shape),
                createStubInstance(Shape),
            ];
            inventoryItemStubs.forEach((shapeStub, index) => {
                inventoryItemsGroupStub.findOne.onCall(index).returns(shapeStub);
            });
            inventoryItemsGroupStub.find.returns(inventoryItemStubs[0]);

            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            inventoryItemsView.handleInventoryItemVisibility(['1', '2', '3']);
            expect(inventoryItemStubs[0].x).to.have.been.calledWith(50);
            expect(inventoryItemStubs[1].x).to.have.been.calledWith(150);
            expect(inventoryItemStubs[2].x).to.have.been.calledWith(250);
        });
    });
    describe('clear inventory item blur', () => {
        // Don't know how to stub multiple shapes in the collection!
        it('should clear blur from items in inventory', () => {
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            inventoryItemsView.clearInventoryItemBlur();
            expect(inventoryItemStub.shadowBlur).to.have.been.calledWith(0);
        });
    });
    describe('glow inventory item', () => {
        it('should glow an item if found', () => {
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            inventoryItemsView.glowInventoryItem(inventoryItemStub);
            expect(inventoryItemStub.clearCache).to.have.been.called;
            expect(inventoryItemStub.shadowColor).to.have.been.calledWith('purple');
            expect(inventoryItemStub.shadowOffset).to.have.been.calledWith({ x: 0, y: 0});
            expect(inventoryItemStub.shadowBlur).to.have.been.calledWith(20);
        });
        it('should not glow an item not found', () => {
            inventoryItemsGroupStub.findOne.yields(null).returns(null);
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            inventoryItemsView.glowInventoryItem(inventoryItemStub);
            expect(inventoryItemStub.clearCache).to.not.have.been.called;
            expect(inventoryItemStub.shadowColor).to.not.have.been.called;
            expect(inventoryItemStub.shadowOffset).to.not.have.been.called;
            expect(inventoryItemStub.shadowBlur).to.not.have.been.called;
        });
    });
    describe('fire inventory item drag end event on Konva dragend', () => {
        it('should fire inventory_item_drag_end event on dragend of an inventory item', () => {
            new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            const dragendHandler = inventoryItemStub.on.getCalls().find((call) => {
                return call.args[0] === 'dragend';
            }).args[1];
            const eventStub = { target: inventoryItemStub };
            dragendHandler(eventStub);
            expect(uiEventEmitterStub.emit).to.have.been.calledWith('inventory_item_drag_end', { draggedItem: inventoryItemStub });
        });
    });
    describe('move dragged item back to inventory', () => {
        it('should move the dragged item back to inventory after dragging', () => {
            new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            const moveDraggedItemBackToInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_end_handled';
            }).args[1];
            const targetStub = createStubInstance(Shape);
            moveDraggedItemBackToInventoryCallback(targetStub);
            expect(targetStub.moveTo).to.have.been.calledWith(inventoryItemsGroupStub);
        });
        it('should not try to move a non-existing dragged item back to inventory after dragging (null safety)', () => {
            new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            const moveDraggedItemBackToInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_end_handled';
            }).args[1];
            try {
                moveDraggedItemBackToInventoryCallback(null);
            } catch (e) {
                assert.fail('should not throw error');
            }
        });
    });
    describe('fire inventory_item_drag_end on Konva dragend', () => {
        it('should fire inventory_item_drag_end event on dragend of an inventory item', () => {
            new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                inventoryItemsGroupStub,
                100
            );
            const dragendHandler = inventoryItemStub.on.getCalls().find((call) => {
                return call.args[0] === 'dragend';
            }).args[1];
            const eventStub = { target: inventoryItemStub };
            dragendHandler(eventStub);
            expect(uiEventEmitterStub.emit).to.have.been.calledWith('inventory_item_drag_end', { draggedItem: inventoryItemStub });
        });
    });
});
