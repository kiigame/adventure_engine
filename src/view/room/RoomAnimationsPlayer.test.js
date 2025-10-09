import { assert } from 'chai';
import { createStubInstance, stub } from 'sinon';
import RoomAnimationsPlayer from './RoomAnimationsPlayer.js';
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
const { Tween, Container, Node, Animation } = pkg;

const uiEventEmitterStub = createStubInstance(EventEmitter, { on: null });

describe('Room animations player tests', function () {
    const buildMockTween = (roomId, isRunning) => {
        const mockContainer = createStubInstance(Container, { id: roomId });
        const mockNode = createStubInstance(Node, { getParent: mockContainer });
        const mockAnimation = createStubInstance(Animation, {
            isRunning: () => isRunning,
            stop: () => null,
        });
        const mockTween = {
            play: stub(),
            node: mockNode,
            anim: mockAnimation
        };

        return { mockTween, mockAnimation };
    };
    it('should start only room\'s animations when entering the room', function () {
        new RoomAnimationsPlayer(uiEventEmitterStub);
        const playRoomAnimationsCallback = uiEventEmitterStub.on.getCall(0).args[1];
        const { mockTween: mockTweenInRoom, mockAnimation: mockAnimationInRoom } = buildMockTween('room-id', false);
        const { mockTween: mockTweenNotInRoom, mockAnimation: mockAnimationNotInRoom } = buildMockTween('other-room-id', true);
        const mockAnimatedObjects = [
            mockTweenInRoom,
            mockTweenNotInRoom
        ];
        playRoomAnimationsCallback({ animatedObjects: mockAnimatedObjects, roomId: 'room-id' });
        assert.isTrue(mockTweenInRoom.play.calledOnce);
        assert.isFalse(mockAnimationInRoom.stop.called);
        assert.isTrue(mockAnimationNotInRoom.stop.calledOnce);
        assert.isFalse(mockTweenNotInRoom.play.called);
    });
});