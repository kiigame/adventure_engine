import { EventEmitter } from "events/EventEmitter";

export class CharacterPosture {
    private posture: String;
    private gameEventEmitter: EventEmitter;

    constructor(posture: String, gameEventEmitter: EventEmitter) {
        this.posture = posture;
        this.gameEventEmitter = gameEventEmitter;
        this.gameEventEmitter.on("change_character_posture", (posture: String) => {
            this.changeCharacterPosture(posture);
        });
    }

    private changeCharacterPosture(posture: String) {
        this.posture = posture;
        this.gameEventEmitter.emit("character_posture_changed", this.posture);
    }

    getPosture(): String {
        return this.posture;
    }
}
