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
     * @param Interactions interactions
     * @param string entityId clicked or dragged item
     * @param string action (click or target item)
     * @param string defaultString (examine or target item)
     */
    resolveCommands(interactions, entityID, action = 'click', defaultString = 'examine') {
        var commands;
        commands = interactions.getCommands(entityID, action);

        // no interaction for the action defined: usual text
        if (commands === null || commands === undefined) {
            commands = [{"command":"monologue", "textkey":{"object": entityID, "string": defaultString}}];
        }

        return commands;
    }
}

export default DefaultInteractionResolver;