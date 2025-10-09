import Interactions from "./Interactions.js";

/** */
class DefaultInteractionResolver {

    constructor(targetCategory) {
        this.targetCategory = targetCategory;
    }

    getTargetCategory() {
        return this.targetCategory;
    }

    /**
     * @param {Interactions} interactions
     * @param {string} entityId clicked or dragged item
     * @param {string} action click or target item
     * @param {string} defaultString examine or target item
     */
    resolveCommands(interactions, entityId, action = 'click', defaultString = 'examine') {
        const commands = interactions.getCommands(entityId, action);

        if (commands !== null && commands !== undefined) {
            return commands;
        }

        // no interaction for the action defined: usual text
        return [{"command":"monologue", "textkey":{"object": entityId, "string": defaultString}}];
    }
}

export default DefaultInteractionResolver;