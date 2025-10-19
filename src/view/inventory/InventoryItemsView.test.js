import { expect, use } from 'chai';
import { createStubInstance, stub } from 'sinon';
import sinonChai from "sinon-chai";
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
import StageObjectGetter from '../stage/StageObjectGetter.js';
import InventoryItemsView from './InventoryItemsView.js';
const { Shape, Group, Collection } = pkg;
use(sinonChai);

describe('inventory item view tests', () => {
    let gameEventEmitterStub;
    let uiEventEmitterStub;
    let stageObjectGetterStub;
    let inventoryItemsStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        gameEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        stageObjectGetterStub = createStubInstance(StageObjectGetter, {});
        inventoryItemsStub = createStubInstance(Group, {});
    });
    describe('reset inventory items', () => {
        // Don't know how to stub multiple shapes in the collection!
        it('should set Shapes in the inventory items group to not visible', () => {
            const shapeStub = createStubInstance(Shape, { setAttr: () => null });
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
            const shapeStub = createStubInstance(Shape, {
                setAttr: () => null,
                x: () => null,
                y: () => null
            });
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
            expect(shapeStub.size).to.have.been.calledWith({ width: 80, height: 80 });
            expect(shapeStub.x).to.have.been.calledWith(50);
            expect(shapeStub.y).to.have.been.calledWith(100);
            expect(shapeStub.setAttr).to.have.been.calledWith('visible', true);
        });
        it('should set mulitple inventory items\' y coordinates correctly', () => {
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
});
