import EventEmitter from "../../events/EventEmitter.js";
import Text from "../../model/Text.js";

class DraggedItemView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Text} interactionText
     * @param {Text} text
     */
    constructor(uiEventEmitter, interactionText, text) {
        this.uiEventEmitter = uiEventEmitter;
        this.interactionText = interactionText;
        this.text = text;

        this.uiEventEmitter.on('dragmove_hover_on_object', ({ target, draggedItem }) => {
            this.showTextOnDragMove(target, draggedItem);
        });
        this.uiEventEmitter.on('dragmove_hover_on_nothing', () => {
            this.clearInteractionText();
        });
        this.uiEventEmitter.on('inventory_left_arrow_draghovered', () => {
            this.clearInteractionText();
        });
        this.uiEventEmitter.on('inventory_right_arrow_draghovered', () => {
            this.clearInteractionText();
        });
        this.uiEventEmitter.on('inventory_item_drag_end_handled', (_draggedItem) => {
            this.clearInteractionText();
        });
    }

    clearInteractionText() {
        this.interactionText.text("");
        // TODO: have DraggedItemView handle its own text drawing
        this.uiEventEmitter.emit('interaction_text_cleared');
    }

    /**
     * @param {Konva.Shape} target
     * @param {Konva.Shape} draggedItem
     */
    showTextOnDragMove(target, draggedItem) {
        this.interactionText.text(this.text.getName(target.id()));
        this.interactionText.x(draggedItem.x() + (draggedItem.width() / 2));
        this.interactionText.y(draggedItem.y() - 30);
        this.interactionText.offset({
            x: this.interactionText.width() / 2
        });

        // TODO: have DraggedItemView handle its own text drawing
        this.uiEventEmitter.emit('text_on_drag_move_updated');
    }
}

export default DraggedItemView;
