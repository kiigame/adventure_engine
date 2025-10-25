import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import CharacterInRoom from './CharacterInRoom.js';
import EventEmitter from '../events/EventEmitter.js';

describe('Character in room model tests', () => {
    let gameEventEmitterStub;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter);
    });
    describe('move character to room', () => {
        it('should set state and emit event', () => {
            const characterInRoom = new CharacterInRoom(gameEventEmitterStub);
            const setCharacterInRoomStateCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'do_transition';
            }).args[1];
            setCharacterInRoomStateCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.equal('room-id');
            expect(
                gameEventEmitterStub.emit.calledWith('character_moved_to_room', { roomId: 'room-id' }),
                'character_moved_to_room not emitted with room_id'
            ).to.equal(true);
        });
    });
});
