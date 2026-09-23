import { EventEmitter } from "../../events/EventEmitter.js";

class NpcMonologueView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {StageObjectGetter} stageObjectGetter
     * @param {Konva.Text} npcMonologueText
     * @param {Konva.Label} npcSpeechBubble
     * @param {int} stageWidth
     */
    constructor(uiEventEmitter, gameEventEmitter, stageObjectGetter, npcSpeechBubble, stageWidth) {
        this.uiEventEmitter = uiEventEmitter;
        this.stageObjectGetter = stageObjectGetter;
        this.npcSpeechBubble = npcSpeechBubble;
        this.npcMonologueText = npcSpeechBubble.getText();
        this.npcTag = npcSpeechBubble.getTag();
        this.stageWidth = stageWidth;

        gameEventEmitter.on('monologue', ({ text, _posture }) => {
            this.clearNpcMonologue();
        });
        gameEventEmitter.on('npc_monologue', ({ npc, text, _characterPosture }) => {
            this.clearNpcMonologue();
            const npcObject = this.stageObjectGetter.getObject(npc);
            this.npcMonologue(npcObject, text);
        });
        this.uiEventEmitter.on('clicked_on_stage', () => {
            this.clearNpcMonologue();
        });
        this.uiEventEmitter.on('inventory_item_drag_start', ({ draggedItem: _draggedItem }) => {
            this.clearNpcMonologue();
        });
    }

    /**
     * Set NPC monologue text and position the NPC speech bubble to the
     * desired NPC.
     * @param {Konva.Shape} npc The object in the stage that will have the speech bubble.
     * @param {string} text The text to be shown in the speech bubble.
     */
    npcMonologue(npc, text) {
        const npcIsOnRight = npc.x() + npc.width() > (this.stageWidth / 2);
        this.npcTag.pointerDirection(npcIsOnRight ? "right" : "left");
        this.npcMonologueText.text(text);
        this.npcMonologueText.width(Math.round(this.npcMonologueText.width()));
        if (npcIsOnRight) {
            if (this.npcMonologueText.width() > npc.x() - 100) {
                this.npcMonologueText.width(npc.x() - 100);
            }
            this.npcSpeechBubble.x(npc.x());
        } else {
            if (this.npcMonologueText.width() > this.stageWidth - (npc.x() + npc.width() + 100)) {
                this.npcMonologueText.width(this.stageWidth - (npc.x() + npc.width() + 100));
            }
            this.npcSpeechBubble.x(npc.x() + npc.width());
        }
        this.npcSpeechBubble.y(Math.round(npc.y() + (npc.height() / 3)));
        this.npcSpeechBubble.show();
        this.uiEventEmitter.emit('npc_monologue_set');
    }

    clearNpcMonologue() {
        this.npcMonologueText.text("");
        this.npcSpeechBubble.hide();
        this.uiEventEmitter.emit('npc_monologue_cleared');
    }
}

export default NpcMonologueView;
