import { assert } from 'chai';
import { createStubInstance, stub } from 'sinon';
import RoomAnimations from './RoomAnimations.js';
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
const { Container, Node, Animation } = pkg;

const uiEventEmitterStub = createStubInstance(EventEmitter, { on: null });

describe('Room animations player tests', function () {
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
        new RoomAnimations(uiEventEmitterStub);
        const playRoomAnimationsCallback = uiEventEmitterStub.on.getCall(0).args[1];
        const { mockTween, mockAnimation } = buildMockTween('room-id');
        const mockAnimatedObjects = [
            mockTween,
        ];
        playRoomAnimationsCallback({ animatedObjects: mockAnimatedObjects, roomId: 'room-id' });
        assert.isTrue(mockTween.play.calledOnce);
        assert.isFalse(mockAnimation.stop.called);
    });
    it('should stop previous room\'s animations when entering the next room', function () {
        new RoomAnimations(uiEventEmitterStub);
        const playRoomAnimationsCallback = uiEventEmitterStub.on.getCall(0).args[1];
        const { mockTween: mockFirstRoomTween, mockAnimation: mockFirstRoomAnimation } = buildMockTween('room-id');
        const { mockTween: mockSecondRoomTween, mockAnimation: mockSecondRoomAnimation } = buildMockTween('other-room-id');
        const mockAnimatedObjects = [
            mockFirstRoomTween,
            mockSecondRoomTween,
        ];
        playRoomAnimationsCallback({ animatedObjects: mockAnimatedObjects, roomId: 'room-id' });
        assert.isTrue(mockFirstRoomTween.play.calledOnce);
        playRoomAnimationsCallback({ animatedObjects: mockAnimatedObjects, roomId: 'other-room-id' });
        assert.isTrue(mockFirstRoomAnimation.stop.calledOnce);
        assert.isTrue(mockSecondRoomTween.play.calledOnce);
        assert.isFalse(mockSecondRoomAnimation.stop.called);
    });
});