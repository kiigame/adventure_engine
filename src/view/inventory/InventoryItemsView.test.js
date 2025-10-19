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
    });
});
