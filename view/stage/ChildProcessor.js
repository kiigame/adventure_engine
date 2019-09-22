/**
 * Adds content to images_json before it is being used to construct the stage.
 */
class ChildProcessor {
    constructor() {
    }

    /**
     * @param {object} imagesJson The JSON object that includes all the layers and images for stage
     * @param {object} newChildren The other JSON object that is to be inserted into images_json so it
     *                          will be added to the stage
     * @param {string} nextLayerId Splice the new content before the layer with this id.
     * @returns {object} The combined JSON object.
     */
    process(imagesJson, newChildren, nextLayerId) {
        var indexOfNextLayer = imagesJson['children'].indexOf(
            imagesJson['children'].find(function(child){
                return child.attrs.id === nextLayerId;
            })
        );

        newChildren.forEach(function(newChild){
            imagesJson['children'].splice(indexOfNextLayer, 0, newChild);
            indexOfNextLayer++; // The nextLayer index has moved
        });

        return imagesJson;
    }
}

module.exports = ChildProcessor;