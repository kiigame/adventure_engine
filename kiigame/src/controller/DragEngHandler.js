import { EventEmitter } from "../events/EventEmitter.js";
import { CommandsHandler } from "./interactions/CommandsHandler.js";
import { DefaultInteractionResolver } from "./interactions/DefaultInteractionResolver.js";
import Interactions from "./interactions/Interactions.js";

class DragEndHandler {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {CommandsHandler} commandsHandler
     * @param {DefaultInteractionResolver[]} dragResolvers
     * @param {Interactions} interactions
     */
    constructor(uiEventEmitter, commandsHandler, dragResolvers, interactions) {
        this.uiEventEmitter = uiEventEmitter;
        this.commandsHandler = commandsHandler;
        this.dragResolvers = dragResolvers;
        this.interactions = interactions;

        this.uiEventEmitter.on('inventory_item_drag_end_on_target', ({ target, draggedItem }) => {
            this.handleDragEnd(target, draggedItem);
        });
    }

    /**
     * @param {Konva.Shape} target
     * @param {Konva.Shape} draggedItem
     */
    handleDragEnd(target, draggedItem) {
        const targetCategory = target.getAttr('category');

        const dragResolver = this.dragResolvers.find((dragResolver) =>
            dragResolver.getTargetCategory() === targetCategory
        );

        if (dragResolver) {
            this.commandsHandler.handleCommands(dragResolver.resolveCommands(
                this.interactions,
                draggedItem.id(),
                target.id(),
                target.id()
            ));
        }

        this.uiEventEmitter.emit('inventory_item_drag_end_interactions_handled');
    }
}

export default DragEndHandler;
