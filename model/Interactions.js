/** */
class Interactions {
    constructor(json) {
        this.json = json;
    }

    getCommands(entityId, action) {
        var commands = null;
        try {
            commands = this.json[entityId][action];
        } catch (e) {
            // Do nothing
        }
        return commands;
    }
}

export default Interactions;