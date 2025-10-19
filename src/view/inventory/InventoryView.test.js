import { expect, use } from 'chai';
import { createStubInstance, stub } from 'sinon';
import sinonChai from "sinon-chai";
import InventoryView from './InventoryView.js';
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
import StageObjectGetter from '../stage/StageObjectGetter.js';
import InventoryItemsView from './InventoryItemsView.js';
const { Shape, Layer } = pkg;
use(sinonChai);

describe('room view tests', () => {
    let gameEventEmitterStub;
    let uiEventEmitterStub;
    let stageObjectGetterStub;
    let inventoryBarLayerStub;
    let inventoryItemsViewStub;
    let leftArrowStub;
    let rightArrowStub;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        uiEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        stageObjectGetterStub = createStubInstance(StageObjectGetter, {});
        leftArrowStub = createStubInstance(Shape, {
            on: () => null,
            hide: () => null,
        });
        rightArrowStub = createStubInstance(Shape, {
            on: () => null,
            hide: () => null,
        });
        inventoryBarLayerStub = createStubInstance(Layer, {
            show: () => null,
            hide: () => null,
            draw: () => null
        });
        inventoryBarLayerStub.find.withArgs('#inventory_left_arrow').returns(leftArrowStub);
        inventoryBarLayerStub.find.withArgs('#inventory_right_arrow').returns(rightArrowStub);
        inventoryItemsViewStub = createStubInstance(InventoryItemsView, {
            resetItems: () => null,
            handleInventoryItemVisibility: () => null,
            clearInventoryItemBlur: () => null,
            show: () => null,
            hide: () => null,
            draw: () => null
        });
    });
    describe('redraw inventory', () => {
        it('should redraw inventory on inventory_view_model_updated', () => {
            new InventoryView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub
            );
            const redrawInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_view_model_updated';
            }).args[1];
            const visibleInventoryItems = ['one', 'two'];
            redrawInventoryCallback({ visibleInventoryItems, isLeftArrowVisible: false, isRightArrowVisible: false });
            expect(inventoryItemsViewStub.resetItems).to.have.been.called;
            expect(inventoryItemsViewStub.handleInventoryItemVisibility).to.have.been.calledWith(visibleInventoryItems);
            expect(leftArrowStub.hide).to.have.been.called;
            expect(rightArrowStub.hide).to.have.been.called;
            expect(inventoryItemsViewStub.clearInventoryItemBlur).to.have.been.called;
            expect(inventoryItemsViewStub.draw).to.have.been.called;
            expect(inventoryBarLayerStub.draw).to.have.been.called;
            expect(uiEventEmitterStub.emit).to.have.been.calledWith('inventory_redrawn');
        });
        it('should show both arrows if requested', () => {
            new InventoryView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub
            );
            const redrawInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_view_model_updated';
            }).args[1];
            const visibleInventoryItems = ['one', 'two'];
            redrawInventoryCallback({ visibleInventoryItems, isLeftArrowVisible: true, isRightArrowVisible: true });
            expect(leftArrowStub.show).to.have.been.called;
            expect(rightArrowStub.show).to.have.been.called;
        });
        it('should show only right arrow if requested', () => {
            new InventoryView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub
            );
            const redrawInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_view_model_updated';
            }).args[1];
            const visibleInventoryItems = ['one', 'two'];
            redrawInventoryCallback({ visibleInventoryItems, isLeftArrowVisible: false, isRightArrowVisible: true });
            expect(leftArrowStub.hide).to.have.been.called;
            expect(rightArrowStub.show).to.have.been.called;
        });
        it('should show only left arrow if requested', () => {
            new InventoryView(
                uiEventEmitterStub,
                gameEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub
            );
            const redrawInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_view_model_updated';
            }).args[1];
            const visibleInventoryItems = ['one', 'two'];
            redrawInventoryCallback({ visibleInventoryItems, isLeftArrowVisible: true, isRightArrowVisible: false });
            expect(leftArrowStub.show).to.have.been.called;
            expect(rightArrowStub.hide).to.have.been.called;
        });
    });
});
