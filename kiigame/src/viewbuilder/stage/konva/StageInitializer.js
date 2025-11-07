class StageInitializer {
    /**
     * Bootstraps Konva stage so that the rest of the stage contents can be built.
     *
     * @param {object} layersJson json data to define Konva layers from
     * @returns {Konva.Stage}
     */
    initialize(layersJson) {
        return Konva.Node.create(
            JSON.stringify(layersJson),
            'container'
        );
    }
}

export default StageInitializer;
