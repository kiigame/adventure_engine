class KonvaObjectLayerPusher {
    /**
     * @param {object[]} objects an array of json objects containing Konva object data in json form
     * @param {Konva.Layer} layer reference to the layer to manipulate
     * @returns {Konva.Layer} reference to the layer that has been manipulated
     */
    execute(objects, layer)  {
        objects.forEach((object) => {
            Konva.Node.create(
                JSON.stringify(object),
            ).moveTo(layer);
        })
        return layer;
    };
}

export default KonvaObjectLayerPusher;
