/** */
class SequenceBuilder {

    constructor(slideBuilder) {
        this.slideBuilder = slideBuilder;
    }

    build(slides, key) {
        var builtSequence = {
            attrs: {},
            children: [],
            className: "Layer"
        };
        builtSequence.attrs.category = 'sequence';
        builtSequence.attrs.visible = false;
        builtSequence.attrs.id = key;
        for (let [index, slide] of slides.entries()) {
            builtSequence.children.push(this.slideBuilder.build(slide, key + '_' + (index + 1)));
        };
        return builtSequence;
    }
}

module.exports = SequenceBuilder;