import { expect } from 'chai';
import { createStubInstance, restore } from 'sinon';
import CharacterInRoomViewModel from './CharacterInRoomViewModel.js';
import EventEmitter from '../../events/EventEmitter.js';

describe('Character in room view model tests', () => {
    let uiEventEmitterStub;
    let gameEventEmitterStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        gameEventEmitterStub = createStubInstance(EventEmitter);
    });
    afterEach(() => {
        restore();
    });
    describe('ready transition', () => {
        it('should go from NOT_IN_ROOM to READY_TO_LEAVE with setting from to null', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
            const readyTransitionCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'ready_transition';
            }).args[1];
            readyTransitionCallback({ type: 'instant', roomId: 'roomy_room' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'READY_TO_LEAVE', transitionType: 'instant', from: null, to: 'roomy_room' });
        });
        it('should override transition type to instant when going from NOT_IN_ROOM to READY_TO_LEAVE', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
            const readyTransitionCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'ready_transition';
            }).args[1];
            readyTransitionCallback({ type: 'regular', roomId: 'roomy_room' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'READY_TO_LEAVE', transitionType: 'instant', from: null, to: 'roomy_room' });
        });
        it('should set READY_TO_LEAVE from IN_ROOM with from with room id and the given type', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'IN_ROOM',
                room: 'previous_room'
            };
            const readyTransitionCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'ready_transition';
            }).args[1];
            readyTransitionCallback({ type: 'regular', roomId: 'roomy_room' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'READY_TO_LEAVE', transitionType: 'regular', from: 'previous_room', to: 'roomy_room' });
        });
    });
    describe('resolve character_moved_to_room', () => {
        it('should go to IN_ROOM directly with transitionType instant and null from', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'READY_TO_LEAVE',
                transitionType: 'instant',
                from: null,
                to: 'room-id'
            }
            const resolveCharacterMovedToRoomCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'character_moved_to_room';
            }).args[1];
            resolveCharacterMovedToRoomCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'IN_ROOM', room: 'room-id' });
            expect(
                uiEventEmitterStub.emit.calledWith('arrived_in_room', 'room-id'),
                'arrived_in_room not emitted with room_id'
            ).to.equal(true);
        });
        it('should go to IN_ROOM directly with transitionType instant and from defined', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'READY_TO_LEAVE',
                transitionType: 'instant',
                from: 'previous_room',
                to: 'room-id'
            }
            const resolveCharacterMovedToRoomCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'character_moved_to_room';
            }).args[1];
            resolveCharacterMovedToRoomCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'IN_ROOM', room: 'room-id' });
            expect(
                uiEventEmitterStub.emit.calledWith('left_room', 'previous_room'),
                'left_room not emitted with previous_room'
            ).to.equal(true);
            expect(
                uiEventEmitterStub.emit.calledWith('arrived_in_room', 'room-id'),
                'arrived_in_room not emitted with room_id'
            ).to.equal(true);
        });
        it('should go from READY_TO_LEAVE with from to IN_TRANSITION with type regular', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'READY_TO_LEAVE',
                transitionType: 'regular',
                from: 'previous_room',
                to: 'room-id'
            };
            const resolveCharacterMovedToRoomCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'character_moved_to_room';
            }).args[1];
            resolveCharacterMovedToRoomCallback({ roomId: 'room-id' });
            expect(
                characterInRoom.state,
                'state does not match'
            ).to.deep.equal({ mode: 'IN_TRANSITION', from: 'previous_room', to: 'room-id' });
            expect(
                uiEventEmitterStub.emit.calledWith('leaving_room'),
                'leaving_room not emitted'
            ).to.equal(true);
        });
        it('should throw if resolving character_moved_to_room while in transition', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
            characterInRoom.state = {
                mode: 'IN_TRANSITION',
                from: 'another-room',
                to: 'room-id'
            };
            const resolveCharacterMovedToRoomCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'character_moved_to_room';
            }).args[1];
            expect(() =>
                resolveCharacterMovedToRoomCallback({ roomId: 'room-id' })
            ).to.throw('Resolving character_moved_to_room with incompatible CharacterInRoom mode IN_TRANSITION');
        });
    });
    describe('moveCharacterFromTransitToRoom', () => {
        it('should move character from IN_TRANSITION to IN_ROOM', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
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
                uiEventEmitterStub.emit.calledWith('left_room', 'another-room'),
                'left_room not emitted with another-room'
            ).to.equal(true);
            expect(
                uiEventEmitterStub.emit.calledWith('arriving_in_room'),
                'arriving_in_room not emitted'
            ).to.equal(true);
            expect(
                uiEventEmitterStub.emit.calledWith('arrived_in_room', 'room-id'),
                'arrived_in_room not emitted with room-id'
            ).to.equal(true);
        });
        it('should throw if finishing transtioning while already in a room', () => {
            const characterInRoom = new CharacterInRoomViewModel(uiEventEmitterStub, gameEventEmitterStub);
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
