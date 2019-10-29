/**
 * Adds new layers to images_json before it is being used to construct the stage.
 */
class LayerAdder {
    constructor() {
    }

    /**
     * @param {object} imagesJson The JSON object that includes all the layers and images for stage
     * @param {object} newLayers The new layers (as a JSON object) that are to be inserted into images_json
     * @param {string} nextLayerId Splice the new layers before the layer with this id.
     * @returns {object} The combined JSON object.
     */
    process(imagesJson, newLayers, nextLayerId) {
        var indexOfNextLayer = imagesJson['children'].indexOf(
            imagesJson['children'].find(function(child){
                return child.attrs.id === nextLayerId;
            })
        );

        newLayers.forEach(function(newLayer){
            imagesJson['children'].splice(indexOfNextLayer, 0, newLayer);
            indexOfNextLayer++; // The nextLayer index has moved
        });

        return imagesJson;
    }
}

export default LayerAdder;
