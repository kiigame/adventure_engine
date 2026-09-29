import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { CharacterInRoom } from './CharacterInRoom';
import { EventEmitter } from "@kiigame/kgae_ts/events/EventEmitter";

describe('Character in room model tests', () => {
    let gameEventEmitterStub: any;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter);
    });
    describe('move character to room', () => {
        it('should set state and emit event', () => {
            const characterInRoom = new CharacterInRoom(gameEventEmitterStub);
            const setCharacterInRoomStateCallback = gameEventEmitterStub.on.getCalls().find((callback: any) => {
                return callback.args[0] === 'do_transition';
            }).args[1];
            setCharacterInRoomStateCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.getState(),
                'state does not match'
            ).to.equal('room-id');
            expect(
                gameEventEmitterStub.emit.calledWith('character_moved_to_room', { roomId: 'room-id' }),
                'character_moved_to_room not emitted with room_id'
            ).to.equal(true);
        });
    });
});
