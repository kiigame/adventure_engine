class KonvaObjectContainerPusher {
    /**
     * @param {object[]} objects an array of json objects containing Konva object data in json form
     * @param {Konva.Node} container reference to the layer or group to manipulate
     * @returns {Konva.Node} reference to the layer or group that has been manipulated
     */
    execute(objects, container)  {
        objects.forEach((object) => {
            Konva.Node.create(
                JSON.stringify(object),
            ).moveTo(container);
        })
        return container;
    };
}

export default KonvaObjectContainerPusher;
