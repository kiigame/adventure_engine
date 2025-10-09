/** */
class Interactions {
    constructor(json) {
        this.json = json;
    }

    getCommands(entityId, action) {
        try {
            return this.json[entityId][action];
        } catch (e) {
            return null;
        }
    }
}

export default Interactions;
