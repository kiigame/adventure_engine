import { EventEmitter } from "@kiigame/kgae_ts";

export class CharacterPosture {
  private posture: string;
  private gameEventEmitter: EventEmitter;

  constructor(posture: string, gameEventEmitter: EventEmitter) {
    this.posture = posture;
    this.gameEventEmitter = gameEventEmitter;
    this.gameEventEmitter.on("change_character_posture", (posture: string) => {
      this.changeCharacterPosture(posture);
    });
  }

  private changeCharacterPosture(posture: string) {
    this.posture = posture;
    this.gameEventEmitter.emit("character_posture_changed", this.posture);
  }

  getPosture(): string {
    return this.posture;
  }
}
