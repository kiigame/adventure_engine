import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import CharacterInRoom from './CharacterInRoom.js';
import EventEmitter from '../events/EventEmitter.js';

describe('Character in room model tests', function () {
    let uiEventEmitterStub;
    let gameEventEmitterStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        gameEventEmitterStub = createStubInstance(EventEmitter, {
            on: () => null,
            emit: () => null
        });
    });
    describe('start transition to room', function () {
        it('should go from NOT_IN_ROOM to IN_ROOM directly', function () {
            const characterInRoom = new CharacterInRoom(uiEventEmitterStub, gameEventEmitterStub);
            const startTransitionToRoomCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'do_transition';
            }).args[1];
            startTransitionToRoomCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'IN_ROOM', room: 'room-id' });
            expect(
                gameEventEmitterStub.emit.calledWith('arriving_in_room'),
                'arriving_in_room not emitted'
            ).to.equal(true);
            expect(
                gameEventEmitterStub.emit.calledWith('arrived_in_room', 'room-id'),
                'arrived_in_room not emitted with room_id'
            ).to.equal(true);
        });
        it('should go from IN_ROOM to IN_TRANSITION', function () {
            const characterInRoom = new CharacterInRoom(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'IN_ROOM',
                room: 'another-room'
            };
            const startTransitionToRoomCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'do_transition';
            }).args[1];
            startTransitionToRoomCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'IN_TRANSITION', from: 'another-room', to: 'room-id' });
            expect(
                gameEventEmitterStub.emit.calledWith('leaving_room'),
                'leaving_room not emitted'
            ).to.equal(true);
        });
        it('should throw if transtioning while in transition', function () {
            const characterInRoom = new CharacterInRoom(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'IN_TRANSITION',
                from: 'another-room',
                to: 'room-id'
            };
            const startTransitionToRoomCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'do_transition';
            }).args[1];
            expect(() =>
                startTransitionToRoomCallback({ roomId: 'room-id' })
            ).to.throw('Doing transition with incompatible CharacterInRoom mode IN_TRANSITION');
        });
    });
});
