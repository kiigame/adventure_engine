import { EventEmitter } from "@kiigame/kgae_ts/events/EventEmitter";

export class CharacterInRoom {
  private gameEventEmitter: EventEmitter;
  private state: string|null;

  constructor(gameEventEmitter: EventEmitter) {
    this.gameEventEmitter = gameEventEmitter;
    this.state = null;
    this.gameEventEmitter.on('do_transition', (params: { roomId: string }) => {
      this.setCharacterInRoomState(params.roomId);
    });
  }

  setCharacterInRoomState(roomId: string) {
    this.state = roomId;
    this.gameEventEmitter.emit('character_moved_to_room', { roomId });
  }

  getState(): string|null {
    return this.state;
  }
};
