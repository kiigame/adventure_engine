import { EventEmitter } from "../events/EventEmitter.js";

class CharacterInRoom {
    /**
     * @param {EventEmitter} gameEventEmitter
     */
    constructor(gameEventEmitter) {
        this.gameEventEmitter = gameEventEmitter;
        this.state = null;
        this.gameEventEmitter.on('do_transition', ({ roomId }) => {
            this.setCharacterInRoomState(roomId);
        });
    }

    setCharacterInRoomState(roomId) {
        this.state = roomId;
        this.gameEventEmitter.emit('character_moved_to_room', { roomId });
    }
};

export default CharacterInRoom;
