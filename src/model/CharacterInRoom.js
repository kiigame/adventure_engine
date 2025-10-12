class CharacterInRoom {
    constructor(uiEventEmitter, gameEventEmitter) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.state = {
            mode: 'NOT_IN_ROOM'
        };
        this.uiEventEmitter.on('room_fade_out_done', () => {
            this.moveCharacterFromTransitToRoom();
        });
        this.gameEventEmitter.on('do_transition', ({ roomId }) => {
            this.startTransitionToRoom(roomId);
        });
        this.gameEventEmitter.on('do_instant_transition', ({ roomId }) => {
            this.doInstantTransition(roomId);
        });
    }

    /**
     * Transition to a room.
     * @param {string} roomId The id of the room to transition to.
     */
    startTransitionToRoom(roomId) {
        if (this.state.mode === 'NOT_IN_ROOM') {
            this.state = {
                mode: 'IN_ROOM',
                room: roomId
            };
            this.gameEventEmitter.emit('arriving_in_room');
            this.gameEventEmitter.emit('arrived_in_room', roomId);
            return;
        }
        if (this.state.mode === 'IN_ROOM') {
            const from = this.state.room;
            this.state = {
                mode: 'IN_TRANSITION',
                from,
                to: roomId
            };
            this.gameEventEmitter.emit('leaving_room');
            return;
        }
        throw new Error('Doing transition with incompatible CharacterInRoom mode ' + this.state.mode);
    }

    /**
     * Transition to a room without ... transitioning.
     * @param {string} roomId room id to move instantly to
     */
    doInstantTransition(roomId) {
        if (this.state.mode === 'IN_ROOM') {
            const from = this.state.room;
            this.gameEventEmitter.emit('left_room', from);
        }
        this.state = {
            mode: 'IN_ROOM',
            room: roomId
        };
        this.gameEventEmitter.emit('arrived_in_room', roomId);
    }

    /**
     * Move the character from "in transition" state to the room.
     * @returns {void}
     */
    moveCharacterFromTransitToRoom() {
        if (this.state.mode === 'IN_TRANSITION') {
            const from = this.state.from;
            const room = this.state.to;
            this.state = {
                mode: 'IN_ROOM',
                room
            };
            this.gameEventEmitter.emit('left_room', from);
            this.gameEventEmitter.emit('arriving_in_room');
            this.gameEventEmitter.emit('arrived_in_room', room);
            return;
        }

        throw new Error('Moving character from in transition to room with incompatible mode ' + this.state.mode);
    }
};

export default CharacterInRoom;
