import { assert } from 'chai';
import { createStubInstance, stub } from 'sinon';
import CharacterInRoom from './CharacterInRoom.js';
import EventEmitter from '../events/EventEmitter.js';

describe('Character in room model tests', function () {
    let uiEventEmitterStub;
    let gameEventEmitterStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        gameEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
    });
    describe('start transition to room', function () {
        it('should go from NOT_IN_ROOM to IN_ROOM directly', function () {
            const characterInRoom = new CharacterInRoom(uiEventEmitterStub, gameEventEmitterStub);
            const startTransitionToRoomCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'do_transition';
            }).args[1];
            startTransitionToRoomCallback({ roomId: 'room-id' });
            assert.deepEqual(characterInRoom.state, { mode: 'IN_ROOM', room: 'room-id' });
        });
    });
});
