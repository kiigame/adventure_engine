class CharacterInRoomViewModel {
    constructor(uiEventEmitter, gameEventEmitter) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.state = {
            mode: 'NOT_IN_ROOM'
        };
        this.uiEventEmitter.on('room_fade_out_done', () => {
            this.moveCharacterFromTransitToRoom();
        });
        this.uiEventEmitter.on('ready_transition', ({ type, roomId }) => {
            this.readyTransition(type, roomId);
        });
        this.gameEventEmitter.on('character_moved_to_room', ({ roomId }) => {
            this.resolveCharacterMovedToRoom(roomId);
        });
    }

    readyTransition(type, roomId) {
        if (this.state.mode !== 'NOT_IN_ROOM' && this.state.mode !== 'IN_ROOM') {
            throw new Error('Resolving ready_transition with incompatible CharacterInRoom mode ' + this.state.mode);
        }
        const transitionType = this.state.mode === 'NOT_IN_ROOM' ? 'instant' : type;
        const from = this.state.mode === 'IN_ROOM' ? this.state.room : null;
        this.state = {
            mode: 'READY_TO_LEAVE',
            transitionType,
            from,
            to: roomId
        };
    }

    resolveCharacterMovedToRoom(roomId) {
        if (this.state.mode !== 'READY_TO_LEAVE') {
            throw new Error('Resolving character_moved_to_room with incompatible CharacterInRoom mode ' + this.state.mode);
        }
        if (this.state.transitionType === 'instant') {
            this.doInstantTransition(roomId);
            return;
        }
        this.startTransitionToRoom(roomId);
    }

    /**
     * Transition to a room.
     * @param {string} roomId The id of the room to transition to.
     */
    startTransitionToRoom(roomId) {
        if (this.state.mode !== 'READY_TO_LEAVE') {
            throw new Error('Starting transition with incompatible CharacterInRoom mode ' + this.state.mode);
        }
        const from = this.state.from;
        this.state = {
            mode: 'IN_TRANSITION',
            from,
            to: roomId
        };
        this.uiEventEmitter.emit('leaving_room');
    }

    /**
     * Transition to a room without ... transitioning.
     * @param {string} roomId room id to move instantly to
     */
    doInstantTransition(roomId) {
        if (this.state.mode !== 'READY_TO_LEAVE') {
            throw new Error('Starting instant transition with incompatible CharacterInRoom mode ' + this.state.mode);
        }
        if (this.state.from) {
            this.uiEventEmitter.emit('left_room', this.state.from);
        }
        this.state = {
            mode: 'IN_ROOM',
            room: roomId
        };
        this.uiEventEmitter.emit('arrived_in_room', roomId);
    }

    /**
     * Move the character from "in transition" state to the room.
     * @returns {void}
     */
    moveCharacterFromTransitToRoom() {
        if (this.state.mode !== 'IN_TRANSITION') {
            throw new Error('Moving character from in transition to room with incompatible mode ' + this.state.mode);
        };
        const from = this.state.from;
        const room = this.state.to;
        this.state = {
            mode: 'IN_ROOM',
            room
        };
        this.uiEventEmitter.emit('left_room', from);
        this.uiEventEmitter.emit('arriving_in_room');
        this.uiEventEmitter.emit('arrived_in_room', room);
        return;
    }
};

export default CharacterInRoomViewModel;
