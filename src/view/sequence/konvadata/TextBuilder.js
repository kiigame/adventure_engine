/** */
class TextBuilder {

    constructor() {
    }

    build(text) {
        var builtText = {
            "attrs": {}
        };
        builtText.attrs.text = text.text;
        builtText.attrs.fontFamily = "Chalkboard SE";
        builtText.attrs.fontSize = 26;
        builtText.attrs.fill = "white";
        builtText.attrs.shadowColor = "#bbbbbb";
        builtText.attrs.shadowBlur = 10;
        builtText.attrs.width = 981;
        builtText.attrs.align = "center";
        builtText.attrs.y = 321;
        builtText.className = "Text";
        return builtText;
    }
}

export default TextBuilder;
