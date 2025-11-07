import { assert } from 'chai';
import { createStubInstance, stub, restore } from 'sinon';
import RoomAnimations from './RoomAnimations.js';
import { EventEmitter } from '../../events/EventEmitter.js';
import pkg from 'konva';
const { Container, Node, Animation } = pkg;

describe('Room animations player tests', function () {
    let gameEventEmitterStub;
    let uiEventEmitterStub;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter);
        uiEventEmitterStub = createStubInstance(EventEmitter);
    });
    afterEach(() => {
        restore();
    });
    const buildMockTween = (roomId, nodeId) => {
        const mockContainer = createStubInstance(Container, { id: roomId });
        const mockNode = createStubInstance(Node, { getParent: mockContainer, id: nodeId });
        const mockAnimation = createStubInstance(Animation);
        const mockTween = {
            play: stub(),
            node: mockNode,
            anim: mockAnimation
        }; // as Tween

        return { mockTween, mockAnimation };
    };
    describe('play room animations', function () {
        it('should start the room animations when entering the room', function () {
            const roomAnimations = new RoomAnimations(gameEventEmitterStub, uiEventEmitterStub, []);
            const playRoomAnimationsCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'arrived_in_room';
            }).args[1];
            const { mockTween, mockAnimation } = buildMockTween('room-id', 'node-id');
            roomAnimations.animatedObjects = [mockTween];
            playRoomAnimationsCallback('room-id');
            assert.isTrue(mockTween.play.calledOnce);
            assert.isFalse(mockAnimation.stop.called);
        });
        it('should stop previous room\'s animations when entering the next room', function () {
            const roomAnimations = new RoomAnimations(gameEventEmitterStub, uiEventEmitterStub, []);
            const playRoomAnimationsCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'arrived_in_room';
            }).args[1];
            const { mockTween: mockFirstRoomTween, mockAnimation: mockFirstRoomAnimation } = buildMockTween('room-id', 'first-node-id');
            const { mockTween: mockSecondRoomTween, mockAnimation: mockSecondRoomAnimation } = buildMockTween('other-room-id', 'second-node-id');
            roomAnimations.animatedObjects = [mockFirstRoomTween, mockSecondRoomTween];
            playRoomAnimationsCallback('room-id');
            assert.isTrue(mockFirstRoomTween.play.calledOnce);
            playRoomAnimationsCallback('other-room-id');
            assert.isTrue(mockFirstRoomAnimation.stop.calledOnce);
            assert.isTrue(mockSecondRoomTween.play.calledOnce);
            assert.isFalse(mockSecondRoomAnimation.stop.called);
        });
    });
    describe('remove animations', () => {
        it('should not play animation after removing it from the room', () => {
            const roomAnimations = new RoomAnimations(gameEventEmitterStub, uiEventEmitterStub, []);
            const playRoomAnimationsCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'arrived_in_room';
            }).args[1];
            const { mockTween } = buildMockTween('room-id', 'node-id');
            roomAnimations.animatedObjects = [mockTween];
            const removeObjectCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'removed_objects';
            }).args[1];
            removeObjectCallback({ objectList: {/* irrelevant for test */}, objectsRemoved: ['node-id'] });
            playRoomAnimationsCallback('room-id');
            assert.isFalse(mockTween.play.calledOnce, 'removed tween was played');
        });
    });
});
