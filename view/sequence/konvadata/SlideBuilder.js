/** */
class SlideBuilder {

    constructor(textBuilder) {
        this.textBuilder = textBuilder;
    }

    build(slide) {
        var builtSlide = {
            "attrs": {}
        };

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
            builtSlide.attrs.height = 643;
            builtSlide.attrs.width = 981;    
            builtSlide.children = [];
            builtSlide.children.push(background);
            builtSlide.children.push(this.textBuilder.build(slide.text));
        } else {
            builtSlide = background;
        }

        builtSlide.attrs.visible = false;
        builtSlide.attrs.category = "sequence";
        builtSlide.attrs.id = slide.id;

        return builtSlide;
    }
}

export default SlideBuilder;
