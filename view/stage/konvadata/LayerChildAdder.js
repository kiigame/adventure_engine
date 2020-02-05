/**
 * Add child elements to a layer in images_json before it is used to construct the stage.
 */
class LayerChildAdder {
    constructor() {
    }

    /**
     * @param {object} imagesJson The JSON object that includes all the layers and images for stage
     * @param {object} newChildren The new children (as a JSON object) that are to be added to the layer
     * @param {string} layerName Add the children to the layer with this id
     * @returns {object} The combined JSON object.
     */
    add(imagesJson, newChildren, layerName)
    {
        var layer = imagesJson.children.find(function(child){
            return child.attrs.id === layerName;
        });
        layer.children.push.apply(
            layer.children,
            newChildren
        );
        return imagesJson;
    }
}

export default LayerChildAdder;
