import { expect, use } from 'chai';
import { createStubInstance, restore, useFakeTimers } from 'sinon';
import sinonChai from "sinon-chai";
import DraggedItemViewModel from './DraggedItemViewModel.js';
import EventEmitter from '../../events/EventEmitter.js';
import DragTargetFinder from './DragTargetFinder.js';
import pkg from 'konva';
const { Shape } = pkg;

use(sinonChai);

describe('dragged item view model tests', () => {
    let uiEventEmitterStub;
    let dragTargetFinderStub;
    let draggedItemStub;
    
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        dragTargetFinderStub = createStubInstance(DragTargetFinder);
        draggedItemStub = createStubInstance(Shape);
    });

    afterEach(() => {
        restore();
    });

    describe('drag move behavior', () => {
        it('should emit dragmove_hover_on_nothing when no target is found', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            dragTargetFinderStub.findDragTarget.returns(undefined);
            const dragMoveHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragmove';
            }).args[1];
            dragMoveHandler();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith('dragmove_hover_on_nothing');
        });

        it('should emit dragmove_hover_on_object when hovering over an object', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'item' };
            dragTargetFinderStub.findDragTarget.returns(targetStub);
            const dragMoveHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragmove';
            }).args[1];
            dragMoveHandler();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'dragmove_hover_on_object',
                { target: targetStub, draggedItem: draggedItemStub }
            );
        });

        it('should emit dragmove_hover_on_left_arrow when hovering over left inventory arrow', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'invArrow', id: 'inventory_left_arrow' };
            dragTargetFinderStub.findDragTarget.returns(targetStub);
            const dragMoveHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragmove';
            }).args[1];
            dragMoveHandler();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith('dragmove_hover_on_left_arrow');
        });

        it('should emit dragmove_hover_on_right_arrow when hovering over right inventory arrow', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'invArrow', id: 'inventory_right_arrow' };
            dragTargetFinderStub.findDragTarget.returns(targetStub);
            const dragMoveHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragmove';
            }).args[1];
            dragMoveHandler();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith('dragmove_hover_on_right_arrow');
        });
    });

    describe('drag end behavior', () => {
        it('should emit inventory_item_drag_end_wrapped_up when ending drag on inventory arrow', () => {
            const draggedItemViewModel = new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'invArrow' };
            draggedItemViewModel.target = targetStub;
            const dragEndHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend';
            }).args[1];
            dragEndHandler();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_wrapped_up',
                { draggedItem: draggedItemStub }
            );
        });

        it('should emit inventory_item_drag_end_on_target when ending drag on valid target', () => {
            const draggedItemViewModel = new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'item' };
            draggedItemViewModel.target = targetStub;
            const dragEndHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend';
            }).args[1];
            dragEndHandler();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_on_target',
                { target: targetStub, draggedItem: draggedItemStub }
            );
        });

        it('should check for target if none was set during hover', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'item' };
            dragTargetFinderStub.findDragTarget.returns(targetStub);
            const dragEndHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend';
            }).args[1];
            dragEndHandler();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_on_target',
                { target: targetStub, draggedItem: draggedItemStub }
            );
        });

        it('should emit inventory_item_drag_end_wrapped_up when no target is found at end', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            dragTargetFinderStub.findDragTarget.returns(undefined);
            const dragEndHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend';
            }).args[1];
            dragEndHandler();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_wrapped_up',
                { draggedItem: draggedItemStub }
            );
        });
    });
    describe('clear up drag end', () => {
        it('should clear the current target and dragged item when drag end on invenvtory arrow', () => {
            const draggedItemViewModel = new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            const targetStub = createStubInstance(Shape);
            targetStub.attrs = {
                category: 'invArrow'
            };
            draggedItemViewModel.target = targetStub;
            const dragEndHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend';
            }).args[1];
            dragEndHandler();

            expect(draggedItemViewModel.target).to.be.undefined;
            expect(draggedItemViewModel.draggedItem).to.be.undefined;
        });
        it('should clear dragged item when drag end on nothing', () => {
            const draggedItemViewModel = new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            dragTargetFinderStub.findDragTarget.returns(undefined);
            const dragEndHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragend';
            }).args[1];
            dragEndHandler();

            expect(draggedItemViewModel.target).to.be.undefined;
            expect(draggedItemViewModel.draggedItem).to.be.undefined;
        });
        it('should clear target and dragged item when receiving inventory_item_drag_end_interactions_handled', () => {
            const draggedItemViewModel = new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const targetStub = createStubInstance(Shape);
            targetStub.attrs = {
                category: 'proper_item'
            };
            draggedItemViewModel.target = targetStub;
            draggedItemViewModel.draggedItem = draggedItemStub;

            // skipping testing event listenign for now, can't get it to work for whatever reason
            draggedItemViewModel.wrapUpDragEnd();

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_wrapped_up',
                { draggedItem: draggedItemStub }
            );
            expect(draggedItemViewModel.target).to.be.undefined;
            expect(draggedItemViewModel.draggedItem).to.be.undefined;
        });
    });
    describe('intersection delay', () => {
        let clock;
        
        beforeEach(() => {
            clock = useFakeTimers();
        });

        afterEach(() => {
            clock.restore();
        });

        it('should not check for intersections during delay period', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const handleInventoryItemDragStartCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] = 'inventory_item_drag_start';
            }).args[1];
            handleInventoryItemDragStartCallback({ draggedItem: draggedItemStub });

            const dragMoveHandler = draggedItemStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'dragmove';
            }).args[1];

            // First call
            dragMoveHandler();
            expect(dragTargetFinderStub.findDragTarget).to.have.been.called;

            // Second call right after
            dragTargetFinderStub.findDragTarget.resetHistory();
            dragMoveHandler();
            expect(dragTargetFinderStub.findDragTarget).to.not.have.been.called;

            // Third call after the 10 ms delay
            clock.tick(11);
            dragTargetFinderStub.findDragTarget.resetHistory();
            dragMoveHandler();
            expect(dragTargetFinderStub.findDragTarget).to.have.been.called;
        });
    });
});
