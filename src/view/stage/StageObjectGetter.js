class StageObjectGetter {
    constructor(stage) {
        this.stage = stage;
    }

    /**
     * Get an object from stage by it's id. Gives an error message in console with
     * the looked up name if it is not found. Basically, a wrapper for
     * stage.find(id) with error messaging, helpful with typos in jsons,
     * and also gives some warnings if an object required by the kiigame.js script
     * itself is missing.
     *
     * @param {string} id name of the object to look up
     * @returns {Konva.Node}
     */
    getObject(id) {
        const object = this.stage.find('#' + id)[0];
        if (object == null) {
            console.warn("Could not find object from stage with id " + id);
        }
        return object;
    }
}

export default StageObjectGetter;
