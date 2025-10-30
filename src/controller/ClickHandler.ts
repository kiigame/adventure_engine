import EventEmitter from "../events/EventEmitter.js";
import CommandsHandler from "./interactions/CommandsHandler.js";
import DefaultInteractionResolver from "./interactions/DefaultInteractionResolver.js";
import Interactions from "./interactions/Interactions.js";
import Konva from 'konva';

export class ClickHandler {
    private uiEventEmitter: EventEmitter;
    private commandsHandler: CommandsHandler;
    private clickResolvers: DefaultInteractionResolver[];
    private interactions: Interactions;

    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {CommandsHandler} commandsHandler
     * @param {DefaultInteractionResolver[]} clickResolvers
     * @param {Interactions} interactions
     */
    constructor(
        uiEventEmitter: EventEmitter,
        commandsHandler: CommandsHandler,
        clickResolvers: DefaultInteractionResolver[],
        interactions: Interactions
    ) {
        this.uiEventEmitter = uiEventEmitter;
        this.commandsHandler = commandsHandler;
        this.clickResolvers = clickResolvers;
        this.interactions = interactions;

        this.uiEventEmitter.on('furniture_clicked', (target: Konva.Shape) => {
            this.handleClick(target);
        });
        this.uiEventEmitter.on('inventory_click', (target: Konva.Shape) => {
            this.handleClick(target);
        });
    }

    /**
     * Handle click interactions on room objects, inventory items & any resolver category ...
     */
    handleClick(target: Konva.Shape) {
        const targetCategory: string = target.getAttr('category');
        const clickResolver: DefaultInteractionResolver|undefined = this.clickResolvers.find((clickResolver) => {
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
