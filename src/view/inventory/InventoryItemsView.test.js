import { expect, use } from 'chai';
import { createStubInstance, restore, assert } from 'sinon';
import sinonChai from "sinon-chai";
import EventEmitter from '../../events/EventEmitter.js';
import StageObjectGetter from '../../util/konva/StageObjectGetter.js';
import InventoryItemsView from './InventoryItemsView.js';
import pkg from 'konva';
const { Shape, Group, Collection } = pkg;
use(sinonChai);

describe('inventory item view tests', () => {
    let gameEventEmitterStub;
    let uiEventEmitterStub;
    let stageObjectGetterStub;
    let inventoryItemsStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        gameEventEmitterStub = createStubInstance(EventEmitter);
        stageObjectGetterStub = createStubInstance(StageObjectGetter);
        inventoryItemsStub = createStubInstance(Group);
    });
    afterEach(() => {
        restore();
    });
    describe('reset inventory items', () => {
        // Don't know how to stub multiple shapes in the collection!
        it('should set Shapes in the inventory items group to not visible', () => {
            const shapeStub = createStubInstance(Shape);
            const collectionStub = createStubInstance(Collection);
            collectionStub.each.yields(shapeStub);
            inventoryItemsStub = createStubInstance(Group, {
                getChildren: collectionStub
            });
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            inventoryItemsView.resetItems();
            expect(shapeStub.setAttr).to.have.been.calledWith('visible', false);
        });
    });
    describe('handle inventory item visibilty', () => {
        it('should set existing item in the inventory visible', () => {
            const shapeStub = createStubInstance(Shape);
            shapeStub.attrs = { id: 'blabla' };
            inventoryItemsStub = createStubInstance(Group);
            inventoryItemsStub.findOne.yields(shapeStub).returns(shapeStub);
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            inventoryItemsView.handleInventoryItemVisibility(['blabla']);
            expect(shapeStub.x).to.have.been.calledWith(50);
            expect(shapeStub.y).to.have.been.calledWith(100);
            expect(shapeStub.setAttr).to.have.been.calledWith('visible', true);
        });
        it('should fetch and setup a newly added item and make it visible', () => {
            const shapeStub = createStubInstance(Shape);
            inventoryItemsStub = createStubInstance(Group);
            stageObjectGetterStub = createStubInstance(StageObjectGetter, { getObject: shapeStub })
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            inventoryItemsView.handleInventoryItemVisibility(['blabla']);
            expect(shapeStub.moveTo).to.have.been.calledWith(inventoryItemsStub);
            expect(shapeStub.clearCache).to.have.been.called;
            expect(shapeStub.x).to.have.been.calledWith(50);
            expect(shapeStub.y).to.have.been.calledWith(100);
            expect(shapeStub.setAttr).to.have.been.calledWith('visible', true);
        });
        it('should set multiple inventory items\' y coordinates correctly', () => {
            const shapeStubs = [
                createStubInstance(Shape),
                createStubInstance(Shape),
                createStubInstance(Shape),
            ];

            inventoryItemsStub = createStubInstance(Group);
            stageObjectGetterStub = createStubInstance(StageObjectGetter);
            shapeStubs.forEach((shapeStub, index) => {
                stageObjectGetterStub.getObject.onCall(index).returns(shapeStub);
            });
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            inventoryItemsView.handleInventoryItemVisibility(['1', '2', '3']);
            expect(shapeStubs[0].x).to.have.been.calledWith(50);
            expect(shapeStubs[1].x).to.have.been.calledWith(150);
            expect(shapeStubs[2].x).to.have.been.calledWith(250);
        });
    });
    describe('clear inventory item blur', () => {
        // Don't know how to stub multiple shapes in the collection!
        it('should clear blur from items in inventory', () => {
            const shapeStub = createStubInstance(Shape);
            const collectionStub = createStubInstance(Collection);
            collectionStub.each.yields(shapeStub);
            inventoryItemsStub = createStubInstance(Group, {
                getChildren: collectionStub
            });
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            inventoryItemsView.clearInventoryItemBlur();
            expect(shapeStub.shadowBlur).to.have.been.calledWith(0);
        });
    });
    describe('glow inventory item', () => {
        it('should glow an item if found', () => {
            const shapeStub = createStubInstance(Shape);
            inventoryItemsStub = createStubInstance(Group);
            inventoryItemsStub.findOne.yields(shapeStub);
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            inventoryItemsView.glowInventoryItem(shapeStub);
            expect(shapeStub.clearCache).to.have.been.called;
            expect(shapeStub.shadowColor).to.have.been.calledWith('purple');
            expect(shapeStub.shadowOffset).to.have.been.calledWith({ x: 0, y: 0});
            expect(shapeStub.shadowBlur).to.have.been.calledWith(20);
        });
        it('should not glow an item not found', () => {
            const shapeStub = createStubInstance(Shape);
            inventoryItemsStub = createStubInstance(Group);
            inventoryItemsStub.findOne.yields(null);
            const inventoryItemsView = new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            inventoryItemsView.glowInventoryItem(shapeStub);
            expect(shapeStub.clearCache).to.not.have.been.called;
            expect(shapeStub.shadowColor).to.not.have.been.called;
            expect(shapeStub.shadowOffset).to.not.have.been.called;
            expect(shapeStub.shadowBlur).to.not.have.been.called;
        });
    });
    describe('move dragged item back to inventory', () => {
        it('should move the dragged item back to inventory after dragging', () => {
            new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            const moveDraggedItemBackToInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend_ended';
            }).args[1];
            const targetStub = createStubInstance(Shape);
            moveDraggedItemBackToInventoryCallback(targetStub);
            expect(targetStub.moveTo).to.have.been.calledWith(inventoryItemsStub);
        });
        it('should not try to move a non-existing dragged item back to inventory after dragging', () => {
            new InventoryItemsView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryItemsStub,
                100
            );
            const moveDraggedItemBackToInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend_ended';
            }).args[1];
            try {
                moveDraggedItemBackToInventoryCallback(null);
            } catch (e) {
                assert.fail('should not throw error');
            }
        });
    });
});
