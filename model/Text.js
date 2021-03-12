class Text {
    constructor(textJson) {
        this.texts = textJson;
    }

    setText(id, key, text) {
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

    /// Find monologue text in object. If a text is not found from th text data by
    /// the parameter, return the default text for the object (if it exists), or
    /// the master default text.
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
        try { // Might not find with object_id
            text = this.texts[object_id][key];
        } catch(e) {
            // Do nothing
        }

        // If no text found, use default text
        if (!text || text.length == 0) {
            // Item's own default
            console.warn("No text " + key + " found for " + object_id);
            try { // Might not find with object_id
                text = this.texts[object_id]['default'];
            } catch(e) {
                // Do nothing
            }

            if (!text) {
                // Master default
                console.warn("Default text not found for " + object_id + ". Using master default.");
                try {
                    text = this.texts["default"]["examine"];
                } catch (e) {
                    text = "Fallback default examine entry missing from texts.json!"; // crude
                }
            }
        }

        return text;
    }
}

export default Text;
