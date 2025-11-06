/** */
class SequenceBuilder {

    constructor(slideBuilder) {
        this.slideBuilder = slideBuilder;
    }

    build(slides, key) {
        const builtSequence = {
            attrs: {},
            children: [],
            className: "Group"
        };
        builtSequence.attrs.category = 'sequence';
        builtSequence.attrs.visible = false;
        builtSequence.attrs.id = key;
        for (const [index, slide] of slides.entries()) {
            builtSequence.children.push(this.slideBuilder.build(slide));
        };
        return builtSequence;
    }
}

export default SequenceBuilder;
