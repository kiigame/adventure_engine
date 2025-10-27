import EventEmitter from "../../events/EventEmitter.js";
import Text from "../../model/Text.js";

class DraggedItemView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Text} interactionText
     */
    constructor(uiEventEmitter, interactionText, text) {
        this.uiEventEmitter = uiEventEmitter;
        this.interactionText = interactionText;

        this.uiEventEmitter.on('dragmove_hover_on_object', ({ target: _target, draggedItem, targetName }) => {
            this.showTextOnDragMove(targetName, draggedItem);
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
        this.uiEventEmitter.on('inventory_item_drag_end_wrapped_up', (_draggedItem) => {
            this.clearInteractionText();
        });
    }

    clearInteractionText() {
        this.interactionText.text("");
        // TODO: have DraggedItemView handle its own text drawing
        this.uiEventEmitter.emit('interaction_text_cleared');
    }

    /**
     * @param {string} targetName
     * @param {Konva.Shape} draggedItem
     */
    showTextOnDragMove(targetName, draggedItem) {
        this.interactionText.text(targetName);
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
