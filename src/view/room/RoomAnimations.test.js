import { assert } from 'chai';
import { createStubInstance, stub } from 'sinon';
import RoomAnimations from './RoomAnimations.js';
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
const { Container, Node, Animation } = pkg;

describe('Room animations player tests', function () {
    let uiEventEmitterStub;
    let gameEventEmitterStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        gameEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
    });
    const buildMockTween = (roomId) => {
        const mockContainer = createStubInstance(Container, { id: roomId });
        const mockNode = createStubInstance(Node, { getParent: mockContainer });
        const mockAnimation = createStubInstance(Animation, {
            stop: () => null,
        });
        const mockTween = {
            play: stub(),
            node: mockNode,
            anim: mockAnimation
        }; // as Tween

        return { mockTween, mockAnimation };
    };
    it('should start the room animations when entering the room', function () {
        const roomAnimations = new RoomAnimations(uiEventEmitterStub, gameEventEmitterStub);
        const playRoomAnimationsCallback = uiEventEmitterStub.on.getCall(0).args[1];
        const { mockTween, mockAnimation } = buildMockTween('room-id');
        roomAnimations.animatedObjects = [mockTween];

        playRoomAnimationsCallback('room-id');
        assert.isTrue(mockTween.play.calledOnce);
        assert.isFalse(mockAnimation.stop.called);
    });
    it('should stop previous room\'s animations when entering the next room', function () {
        const roomAnimations = new RoomAnimations(uiEventEmitterStub, gameEventEmitterStub);
        const playRoomAnimationsCallback = uiEventEmitterStub.on.getCall(0).args[1];
        const { mockTween: mockFirstRoomTween, mockAnimation: mockFirstRoomAnimation } = buildMockTween('room-id');
        const { mockTween: mockSecondRoomTween, mockAnimation: mockSecondRoomAnimation } = buildMockTween('other-room-id');
        roomAnimations.animatedObjects = [mockFirstRoomTween, mockSecondRoomTween];
        playRoomAnimationsCallback('room-id');
        assert.isTrue(mockFirstRoomTween.play.calledOnce);
        playRoomAnimationsCallback('other-room-id');
        assert.isTrue(mockFirstRoomAnimation.stop.calledOnce);
        assert.isTrue(mockSecondRoomTween.play.calledOnce);
        assert.isFalse(mockSecondRoomAnimation.stop.called);
    });
});