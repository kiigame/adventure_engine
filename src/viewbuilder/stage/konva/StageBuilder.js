class StageBuilder {
    /**
     * @param {object} layersJson json data to define Konva layers from
     * @returns {Konva.Stage}
     */
    build(layersJson) {
        return Konva.Node.create(
            JSON.stringify(layersJson),
            'container'
        );
    }
}

export default StageBuilder;
