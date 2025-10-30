import { TextData, textDataSchema } from "./schema/TextModelSchema.js";

export class Text {
    private texts: TextData;
    private logger: Console;

    constructor(textJson: unknown, logger: Console = console) {
        this.texts = textDataSchema.parse(textJson);
        this.logger = logger;
    }

    /**
     * Create or update a text entry for a game entity at runtime.
     *
     * @param {string} id object id to save the text
     * @param {string} key
     * @param {string} text
     */
    setText(id: string, key: string, text: string) {
        if (!this.texts[id]) {
            this.texts[id] = { [key]: text };
            return;
        }
        this.texts[id][key] = text;
    }

    getName(id: string): string {
        try {
            return this.texts[id].name;
        } catch (e) {
            return '';
        }
    }

    /**
     * Find text in object. If a text is not found from the text data with the parameter,
     * return the default text for the object (if it exists), or the master default text.
     *
     * @param {string} object_id The id of the object which's texts are looked up
     * @param {string} key The key to look up the text with. If null, set to 'examine' by
     *                     default. Otherwise usually the name of the other object in
     *                     item-object interactions.
     * @return {string} The text found, or the default text.
     */
    getText(object_id: string, key: string = 'examine'): string {
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

    getDefaultExamine(): string {
        if (!this.texts['default'] || !this.texts['default']['examine']) {
            return "Fallback default examine entry missing from texts.json!"; // crude
        }

        return this.texts["default"]["examine"];
    }
}
