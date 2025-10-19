class Text {
    constructor(textJson, logger = console) {
        this.texts = textJson;
        this.logger = logger;
    }

    setText(id, key, text) {
        if (!this.texts[id]) {
            this.texts[id] = [];
        }
        this.texts[id][key] = text;
    }

    getName(id) {
        try {
            return this.texts[id].name;
        } catch (e) {
            return '';
        }
    }

    /// Find text in object. If a text is not found from the text data with the parameter,
    /// return the default text for the object (if it exists), or the master default text.
    /// @param object_id The id of the object which's texts are looked up.
    /// @param key The key to look up the text with. If null, set to 'examine' by
    ///            default. Otherwise usually the name of the other object in
    ///            item-object interactions.
    /// @return The text found, or the default text.
    getText(object_id, key = 'examine') {
        if (!this.texts[object_id]) {
            return this.getDefaultExamine();
        }

        let text = this.texts[object_id][key];

        // If no text found, use default text
        if (!text || text.length == 0) {
            // Item's own default
            this.logger.warn("No text " + key + " found for " + object_id);
            text = this.texts[object_id]['default'];

            if (!text) {
                // Master default
                this.logger.warn("Default text not found for " + object_id + ". Using master default.");
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
