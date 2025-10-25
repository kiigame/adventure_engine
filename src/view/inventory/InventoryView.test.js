import { expect, use } from 'chai';
import { createStubInstance, restore } from 'sinon';
import sinonChai from "sinon-chai";
import InventoryView from './InventoryView.js';
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
import StageObjectGetter from '../../util/konva/StageObjectGetter.js';
import InventoryItemsView from './InventoryItemsView.js';
import InventoryArrowsView from './InventoryArrowsView.js';
const { Shape, Layer } = pkg;
use(sinonChai);

describe('inventory view tests', () => {
    let uiEventEmitterStub;
    let stageObjectGetterStub;
    let inventoryBarLayerStub;
    let inventoryItemsViewStub;
    let inventoryArrowsViewStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        stageObjectGetterStub = createStubInstance(StageObjectGetter);
        inventoryArrowsViewStub = createStubInstance(InventoryArrowsView);
        inventoryBarLayerStub = createStubInstance(Layer);
        inventoryItemsViewStub = createStubInstance(InventoryItemsView);
    });
    afterEach(() => {
        restore();
    });
    describe('redraw inventory', () => {
        it('should redraw inventory on inventory_view_model_updated', () => {
            new InventoryView(
                uiEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub,
                inventoryArrowsViewStub
            );
            const redrawInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_view_model_updated';
            }).args[1];
            const visibleInventoryItems = ['one', 'two'];
            redrawInventoryCallback({ visibleInventoryItems, isLeftArrowVisible: false, isRightArrowVisible: false });
            expect(inventoryItemsViewStub.resetItems).to.have.been.called;
            expect(inventoryItemsViewStub.handleInventoryItemVisibility).to.have.been.calledWith(visibleInventoryItems);
            expect(inventoryArrowsViewStub.toggleArrowVisibility).to.have.been.calledWith(false, false);
            expect(inventoryItemsViewStub.clearInventoryItemBlur).to.have.been.called;
            expect(inventoryItemsViewStub.draw).to.have.been.called;
            expect(inventoryBarLayerStub.draw).to.have.been.called;
            expect(inventoryArrowsViewStub.draw).to.have.been.called;
            expect(uiEventEmitterStub.emit).to.have.been.calledWith('inventory_redrawn');
        });
        it('should show both arrows if requested', () => {
            new InventoryView(
                uiEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub,
                inventoryArrowsViewStub
            );
            const redrawInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_view_model_updated';
            }).args[1];
            const visibleInventoryItems = ['one', 'two'];
            redrawInventoryCallback({ visibleInventoryItems, isLeftArrowVisible: true, isRightArrowVisible: true });
            expect(inventoryArrowsViewStub.toggleArrowVisibility).to.have.been.calledWith(true, true);
        });
        it('should show only right arrow if requested', () => {
            new InventoryView(
                uiEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub,
                inventoryArrowsViewStub
            );
            const redrawInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_view_model_updated';
            }).args[1];
            const visibleInventoryItems = ['one', 'two'];
            redrawInventoryCallback({ visibleInventoryItems, isLeftArrowVisible: false, isRightArrowVisible: true });
            expect(inventoryArrowsViewStub.toggleArrowVisibility).to.have.been.calledWith(false, true);
        });
        it('should show only left arrow if requested', () => {
            new InventoryView(
                uiEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub,
                inventoryArrowsViewStub
            );
            const redrawInventoryCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_view_model_updated';
            }).args[1];
            const visibleInventoryItems = ['one', 'two'];
            redrawInventoryCallback({ visibleInventoryItems, isLeftArrowVisible: true, isRightArrowVisible: false });
            expect(inventoryArrowsViewStub.toggleArrowVisibility).to.have.been.calledWith(true, false);
        });
    });
    describe('handle arrived in room', () => {
        it('should show inventory if the room is not full screen', () => {
            stageObjectGetterStub = createStubInstance(StageObjectGetter, {
                getObject: { attrs: {} }
            });
            new InventoryView(
                uiEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub,
                inventoryArrowsViewStub
            );
            const handleArrivedInRoomCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'arrived_in_room';
            }).args[1];
            handleArrivedInRoomCallback('room-id');
            expect(inventoryItemsViewStub.show).to.have.been.called;
            expect(inventoryArrowsViewStub.show).to.have.been.called;
            expect(inventoryBarLayerStub.show).to.have.been.called;
        });
        it('shoud not show inventory it the room is full screen', () => {
            stageObjectGetterStub = createStubInstance(StageObjectGetter, {
                getObject: { attrs: { fullScreen: true } }
            });
            new InventoryView(
                uiEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub,
                inventoryArrowsViewStub
            );
            const handleArrivedInRoomCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'arrived_in_room';
            }).args[1];
            handleArrivedInRoomCallback('room-id');
            expect(inventoryItemsViewStub.show).to.not.have.been.called;
            expect(inventoryArrowsViewStub.show).to.not.have.been.called;
            expect(inventoryBarLayerStub.show).to.not.have.been.called;
        });
    });
    describe('handle drag move hover on object', () => {
        it('should handle drag move hover on object', () => {
            new InventoryView(
                uiEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub,
                inventoryArrowsViewStub
            );
            const handleDragMoveHoverOnObjectCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragmove_hover_on_object';
            }).args[1];
            const targetStub = createStubInstance(Shape);
            const draggedStub = createStubInstance(Shape);
            handleDragMoveHoverOnObjectCallback({ target: targetStub, dragged_item: draggedStub });
            expect(inventoryItemsViewStub.clearInventoryItemBlur).to.have.been.called;
            expect(inventoryItemsViewStub.glowInventoryItem).to.have.been.calledWith(targetStub);
            expect(inventoryItemsViewStub.draw).to.have.been.called;
            expect(inventoryArrowsViewStub.draw).to.have.been.called;
            expect(inventoryBarLayerStub.draw).to.have.been.called;
        });
    });
    describe('handle drag move hover on nothing', () => {
        it('should handle drag move hover on nothing', () => {
            new InventoryView(
                uiEventEmitterStub,
                stageObjectGetterStub,
                inventoryBarLayerStub,
                inventoryItemsViewStub,
                inventoryArrowsViewStub
            );
            const handleDragMoveHoverOnNothingCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragmove_hover_on_nothing';
            }).args[1];
            handleDragMoveHoverOnNothingCallback();
            expect(inventoryItemsViewStub.clearInventoryItemBlur).to.have.been.called;
            expect(inventoryItemsViewStub.draw).to.have.been.called;
            expect(inventoryArrowsViewStub.draw).to.have.been.called;
            expect(inventoryBarLayerStub.draw).to.have.been.called;
        });
    });
});
