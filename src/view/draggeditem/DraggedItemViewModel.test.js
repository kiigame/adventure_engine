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
            dragTargetFinderStub.findDragTarget.returns(undefined);
            
            const dragMoveHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_move';
            }).args[1];

            dragMoveHandler({ draggedItem: draggedItemStub });

            expect(uiEventEmitterStub.emit).to.have.been.calledWith('dragmove_hover_on_nothing');
        });

        it('should emit dragmove_hover_on_object when hovering over an object', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'item' };
            dragTargetFinderStub.findDragTarget.returns(targetStub);
            
            const dragMoveHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_move';
            }).args[1];

            dragMoveHandler({ draggedItem: draggedItemStub });

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'dragmove_hover_on_object',
                { target: targetStub, draggedItem: draggedItemStub }
            );
        });

        it('should emit dragmove_hover_on_left_arrow when hovering over left inventory arrow', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'invArrow', id: 'inventory_left_arrow' };
            dragTargetFinderStub.findDragTarget.returns(targetStub);
            
            const dragMoveHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_move';
            }).args[1];

            dragMoveHandler({ draggedItem: draggedItemStub });

            expect(uiEventEmitterStub.emit).to.have.been.calledWith('dragmove_hover_on_left_arrow');
        });

        it('should emit dragmove_hover_on_right_arrow when hovering over right inventory arrow', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'invArrow', id: 'inventory_right_arrow' };
            dragTargetFinderStub.findDragTarget.returns(targetStub);
            
            const dragMoveHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_move';
            }).args[1];

            dragMoveHandler({ draggedItem: draggedItemStub });

            expect(uiEventEmitterStub.emit).to.have.been.calledWith('dragmove_hover_on_right_arrow');
        });
    });

    describe('drag end behavior', () => {
        it('should emit inventory_item_drag_end_handled when ending drag on inventory arrow', () => {
            const draggedItemViewModel = new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'invArrow' };
            draggedItemViewModel.target = targetStub;
            
            const dragEndHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_end';
            }).args[1];

            dragEndHandler({ draggedItem: draggedItemStub });

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_handled',
                draggedItemStub
            );
        });

        it('should emit inventory_item_drag_end_on_target when ending drag on valid target', () => {
            const draggedItemViewModel = new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'item' };
            draggedItemViewModel.target = targetStub;
            
            const dragEndHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_end';
            }).args[1];

            dragEndHandler({ draggedItem: draggedItemStub });

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_on_target',
                { target: targetStub, draggedItem: draggedItemStub }
            );
        });

        it('should check for target if none was set during hover', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const targetStub = createStubInstance(Shape);
            targetStub.attrs = { category: 'item' };
            dragTargetFinderStub.findDragTarget.returns(targetStub);
            
            const dragEndHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_end';
            }).args[1];

            dragEndHandler({ draggedItem: draggedItemStub });

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_on_target',
                { target: targetStub, draggedItem: draggedItemStub }
            );
        });

        it('should emit inventory_item_drag_end_handled when no target is found at end', () => {
            new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            dragTargetFinderStub.findDragTarget.returns(undefined);
            
            const dragEndHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_end';
            }).args[1];

            dragEndHandler({ draggedItem: draggedItemStub });

            expect(uiEventEmitterStub.emit).to.have.been.calledWith(
                'inventory_item_drag_end_handled',
                draggedItemStub
            );
        });
    });
    describe('clear target on drag end handled', () => {
        it('should clear the current target when drag end is handled', () => {
            const draggedItemViewModel = new DraggedItemViewModel(uiEventEmitterStub, dragTargetFinderStub);
            const targetStub = createStubInstance(Shape);
            draggedItemViewModel.target = targetStub;
            
            const dragEndHandledHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_end_handled';
            }).args[1];

            dragEndHandledHandler(draggedItemStub);
            expect(draggedItemViewModel.target).to.be.undefined;
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
            const dragMoveHandler = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'inventory_item_drag_move';
            }).args[1];

            // First call
            dragMoveHandler({ draggedItem: draggedItemStub });
            expect(dragTargetFinderStub.findDragTarget).to.have.been.called;

            // Second call right after
            dragTargetFinderStub.findDragTarget.resetHistory();
            dragMoveHandler({ draggedItem: draggedItemStub });
            expect(dragTargetFinderStub.findDragTarget).to.not.have.been.called;

            // Third call after the 10 ms delay
            clock.tick(11);
            dragTargetFinderStub.findDragTarget.resetHistory();
            dragMoveHandler({ draggedItem: draggedItemStub });
            expect(dragTargetFinderStub.findDragTarget).to.have.been.called;
        });
    });
});
