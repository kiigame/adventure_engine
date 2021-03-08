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
     * @param string targetId
     * @param string action (click or dragged item)
     * @param string defaultString (examine or dragged item)
     */
    resolveCommands(interactions, targetId, action = 'click', defaultString = 'examine') {
        var commands;
        commands = interactions.getCommands(targetId, action);

        // no interaction for the action defined: usual text
        if (commands === null || commands === undefined) {
            commands = [{"command":"monologue", "textkey":{"object": targetId, "string": defaultString}}];
        }

        return commands;
    }
}

export default DefaultInteractionResolver;