/** */
class SlideBuilder {

    constructor(textBuilder) {
        this.textBuilder = textBuilder;
    }

    build(slide, slideId) {
        var builtSlide = {
            "attrs": {}
        };
        builtSlide.attrs.visible = false;
        builtSlide.attrs.category = "sequence";
        builtSlide.attrs.height = 643;
        builtSlide.attrs.width = 981;
        builtSlide.attrs.id = slideId;

        var background = {
            "attrs": {}
        };

        if (slide.imageSrc) {
            background.attrs.src = slide.imageSrc;
            background.className = "Image";
        } else {
            background.attrs.x = 0;
            background.attrs.y = 0;
            background.attrs.fill = "black";
            background.attrs.height = 643;
            background.attrs.width = 981;
            background.className = "Rect";
        }

        if (slide.text) {
            builtSlide.className = "Group";
            builtSlide.children = [];
            builtSlide.children.push(background);
            builtSlide.children.push(this.textBuilder.build(slide.text));
        } else {
            builtSlide = background;
        }

        return builtSlide;
    }
}

module.exports = SlideBuilder;