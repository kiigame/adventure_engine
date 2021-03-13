class Text {
    constructor(textJson) {
        this.texts = textJson;
    }

    setText(id, key, text) {
        if (!this.texts[id]) {
            this.texts[id] = [];
        }
        this.texts[id][key] = text;
    }

    getName(id) {
        var name = '';
        // Don't cause a mass of errors if no text found
        try {
            name = this.texts[id].name;
        } catch (e) {
            // Do nothing
        }

        return name;
    }

    /// Find text in object. If a text is not found from th text data by the parameter,
    /// return the default text for the object (if it exists), or the master default text.
    /// @param object_id The id of the object which's texts are looked up.
    /// @param key The key to look up the text with. If null, set to 'examine' by
    ///            default. Otherwise usually the name of the other object in
    ///            item-object interactions.
    /// @return The text found, or the default text.
    getText(object_id, key) {
        if (key == null) {
            key = 'examine';
        }

        var text = null;
        if (!this.texts[object_id]) {
            return this.getDefaultExamine();
        }

        text = this.texts[object_id][key];

        // If no text found, use default text
        if (!text || text.length == 0) {
            // Item's own default
            console.warn("No text " + key + " found for " + object_id);
            text = this.texts[object_id]['default'];

            if (!text) {
                // Master default
                console.warn("Default text not found for " + object_id + ". Using master default.");
                text = this.getDefaultExamine();
            }
        }

        return text;
    }

    getDefaultExamine() {
        if (!this.texts['default'] || !this.texts['default']['examine']) {
            return "Fallback default examine entry missing from texts.json!"; // crude
        }

        return this.texts["default"]["examine"];
    }
}

export default Text;
