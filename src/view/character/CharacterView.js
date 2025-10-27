import EventEmitter from "../../events/EventEmitter.js";

class CharacterView {
    /**
     * @param {Konva.Layer} characterLayer
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(characterLayer, uiEventEmitter) {
        this.characterLayer = characterLayer;
        uiEventEmitter.on('character_animation_started', () => {
            this.drawCharacterLayer();
        });
        uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.hideCharacter();
        });
        uiEventEmitter.on('current_room_changed', (room) => {
            // Slightly kludgy way of checking if we want to show character
            if (room.attrs.fullScreen) {
                return;
            }
            this.showCharacter();
        });
        uiEventEmitter.on('character_monologue_cleared', () => {
            this.drawCharacterLayer();
        });
        uiEventEmitter.on('character_monologue_set', () => {
            this.drawCharacterLayer();
        });
    }

    showCharacter() {
        this.characterLayer.show();
        this.drawCharacterLayer();
    }

    hideCharacter() {
        this.characterLayer.hide();
    }

    drawCharacterLayer() {
        this.characterLayer.draw();
    }
}

export default CharacterView;
