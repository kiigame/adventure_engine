import EventEmitter from "../../events/EventEmitter.js";

class NpcMonologueView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {Konva.Text} npcMonologueText
     * @param {Konva.Label} npcSpeechBubble
     * @param {int} stageWidth
     */
    constructor(uiEventEmitter, gameEventEmitter, npcSpeechBubble, stageWidth) {
        this.uiEventEmitter = uiEventEmitter;
        this.npcSpeechBubble = npcSpeechBubble;
        this.npcMonologueText = npcSpeechBubble.getText();
        this.npcTag = npcSpeechBubble.getTag();
        this.stageWidth = stageWidth;

        gameEventEmitter.on('monologue', (_text) => {
            this.clearNpcMonologue();
        });
        gameEventEmitter.on('npc_monologue', ({ npc, text }) => {
            this.clearNpcMonologue();
            this.npcMonologue(npc, text);
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
        this.npcMonologueText.text(text);
        this.npcMonologueText.width(Math.round(this.npcMonologueText.width()));
        if (npc.x() + npc.width() > (this.stageWidth / 2)) {
            this.npcTag.pointerDirection("right");
            if (this.npcMonologueText.width() > npc.x() - 100) {
                this.npcMonologueText.width(npc.x() - 100);
            }
            this.npcSpeechBubble.x(npc.x());
        } else {
            this.npcTag.pointerDirection("left");
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
