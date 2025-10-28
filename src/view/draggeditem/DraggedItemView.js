import EventEmitter from "../../events/EventEmitter.js";

class DraggedItemView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Layer} fullScreenLayer
     * @param {Konva.Text} interactionText
     */
    constructor(uiEventEmitter, fullScreenLayer, interactionText) {
        this.uiEventEmitter = uiEventEmitter;
        this.fullScreenLayer = fullScreenLayer;
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
        this.fullScreenLayer.draw();
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
        this.fullScreenLayer.draw();
    }
}

export default DraggedItemView;
