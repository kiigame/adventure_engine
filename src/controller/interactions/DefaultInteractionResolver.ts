import Interactions from "./Interactions.js";

export class DefaultInteractionResolver {
    private targetCategory: string;

    /**
     * @param {string} targetCategory
     */
    constructor(targetCategory: string = 'click') {
        this.targetCategory = targetCategory;
    }

    getTargetCategory(): string {
        return this.targetCategory;
    }

    /**
     * @param {Interactions} interactions
     * @param {string} entityId clicked or dragged item
     * @param {string} action click or target item
     * @param {string} defaultString examine or target item
     */
    resolveCommands(
        interactions: Interactions,
        entityId: string,
        action: string = 'click',
        defaultString: string = 'examine'
    ) {
        const commands = interactions.getCommands(entityId, action);

        if (commands !== null && commands !== undefined) {
            return commands;
        }

        // no interaction for the action defined: usual text
        return [{"command":"monologue", "textkey":{"object": entityId, "string": defaultString}}];
    }
}
