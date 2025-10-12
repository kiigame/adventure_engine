import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import CharacterInRoom from './CharacterInRoom.js';
import EventEmitter from '../events/EventEmitter.js';

describe('Character in room model tests', () => {
    let uiEventEmitterStub;
    let gameEventEmitterStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        gameEventEmitterStub = createStubInstance(EventEmitter, {
            on: () => null,
            emit: () => null
        });
    });
    describe('start transition to room', () => {
        it('should go from NOT_IN_ROOM to IN_ROOM directly', () => {
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
        it('should go from IN_ROOM to IN_TRANSITION', () => {
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
        it('should throw if transtioning while in transition', () => {
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
    describe('instant transition to room', () => {
        it('should go from NOT_IN_ROOM to IN_ROOM directly', () => {
            const characterInRoom = new CharacterInRoom(uiEventEmitterStub, gameEventEmitterStub);
            const doInstantTransitionCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'do_instant_transition';
            }).args[1];
            doInstantTransitionCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'IN_ROOM', room: 'room-id' });
            expect(
                gameEventEmitterStub.emit.calledWith('arrived_in_room', 'room-id'),
                'arrived_in_room not emitted with room-id'
            ).to.equal(true);
        });
        it('should go from IN_ROOM to IN_ROOM', function () {
            const characterInRoom = new CharacterInRoom(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'IN_ROOM',
                room: 'another-room'
            };
            const doInstantTransitionCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'do_instant_transition';
            }).args[1];
            doInstantTransitionCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'IN_ROOM', room: 'room-id' });
            expect(
                gameEventEmitterStub.emit.calledWith('left_room', 'another-room'),
                'left_room not emitted with another-room'
            ).to.equal(true);
            expect(
                gameEventEmitterStub.emit.calledWith('arrived_in_room', 'room-id'),
                'arrived_in_room not emitted with room-id'
            ).to.equal(true);
        });
    });
    describe('moveCharacterFromTransitToRoom', () => {
        it('should move character from IN_TRANSITION to IN_ROOM', () => {
            const characterInRoom = new CharacterInRoom(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'IN_TRANSITION',
                from: 'another-room',
                to: 'room-id'
            };
            const roomFadeOutDoneCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'room_fade_out_done';
            }).args[1];
            roomFadeOutDoneCallback();
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'IN_ROOM', room: 'room-id' });
            expect(
                gameEventEmitterStub.emit.calledWith('left_room', 'another-room'),
                'left_room not emitted with another-room'
            ).to.equal(true);
            expect(
                gameEventEmitterStub.emit.calledWith('arriving_in_room'),
                'arriving_in_room not emitted'
            ).to.equal(true);
            expect(
                gameEventEmitterStub.emit.calledWith('arrived_in_room', 'room-id'),
                'arrived_in_room not emitted with room-id'
            ).to.equal(true);
        });
        it('should throw if finishing transtioning while already in a room', () => {
            const characterInRoom = new CharacterInRoom(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'IN_ROOM',
                room: 'room-id'
            };
            const roomFadeOutDoneCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'room_fade_out_done';
            }).args[1];
            expect(() =>
                roomFadeOutDoneCallback()
            ).to.throw('Moving character from in transition to room with incompatible mode IN_ROOM');
        });
    });
});
