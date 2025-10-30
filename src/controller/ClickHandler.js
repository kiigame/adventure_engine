import EventEmitter from "../events/EventEmitter.js";
import CommandsHandler from "./interactions/CommandsHandler.js";
import DefaultInteractionResolver from "./interactions/DefaultInteractionResolver.js";
import Interactions from "./interactions/Interactions.js";

class ClickHandler {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {CommandsHandler} commandsHandler
     * @param {DefaultInteractionResolver} clickResolvers
     * @param {Interactions} interactions
     */
    constructor(uiEventEmitter, commandsHandler, clickResolvers, interactions) {
        this.uiEventEmitter = uiEventEmitter;
        this.commandsHandler = commandsHandler;
        this.clickResolvers = clickResolvers;
        this.interactions = interactions;

        this.uiEventEmitter.on('furniture_clicked', (target) => {
            this.handleClick(target);
        });
        this.uiEventEmitter.on('inventory_click', (target) => {
            this.handleClick(target);
        });
    }

    /**
     * Handle click interactions on room objects, inventory items & any resolver category ...
     * @param {Konva.Shape} target
     */
    handleClick(target) {
        const targetCategory = target.getAttr('category');
        const clickResolver = this.clickResolvers.find(function (clickResolver) {
            return clickResolver.getTargetCategory() === targetCategory;
        });

        if (clickResolver) {
            this.commandsHandler.handleCommands(clickResolver.resolveCommands(
                this.interactions,
                target.id()
            ));
        }
    }
}

export default ClickHandler;
