import { EventEmitter } from "../../events/EventEmitter.js";

class CharacterSpeechView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {Konva.Text} monologue
     * @param {Konva.Label} characterSpeechBubble
     * @param {int} stageHeight
     */
    constructor(uiEventEmitter, gameEventEmitter, monologue, characterSpeechBubble, stageHeight) {
        this.uiEventEmitter = uiEventEmitter;
        this.monologue = monologue;
        this.characterSpeechBubble = characterSpeechBubble;
        this.stageHeight = stageHeight;

        gameEventEmitter.on('monologue', (text) => {
            this.clearMonologue();
            this.setMonologue(text);
        });
        gameEventEmitter.on('npc_monologue', ({ _npc, _text }) => {
            this.clearMonologue();
        });
        this.uiEventEmitter.on('clicked_on_stage', () => {
            this.clearMonologue();
        });
        this.uiEventEmitter.on('inventory_item_drag_start', ({ draggedItem: _draggedItem }) => {
            this.clearMonologue();
        });
    }

    /**
     * Set character speech text
     * @param {string} text The text to be shown in the monologue bubble.
     */
    setMonologue(text) {
        this.monologue.setWidth('auto');
        this.characterSpeechBubble.show();
        this.monologue.text(text);
        if (this.monologue.width() > 524) {
            this.monologue.width(524);
            this.monologue.text(text);
        }

        this.characterSpeechBubble.y(this.stageHeight - 100 - 15 - this.monologue.height() / 2);
        this.uiEventEmitter.emit('character_monologue_set');
    }

    clearMonologue() {
        this.monologue.text("");
        this.characterSpeechBubble.hide();
        this.uiEventEmitter.emit('character_monologue_cleared');
    }
}

export default CharacterSpeechView;
