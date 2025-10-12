class CharacterFramesBuilder {
    constructor(position) {
        this.position = position;
    }

    build(characterFramesJson) {
        const builtFrames = [];
        for (const frameData of characterFramesJson) {
            builtFrames.push(this.buildFrame(frameData));
        }
        return builtFrames;
    }

    buildFrame(frameData) {
        const frame = {
            attrs: {
                "id": frameData.id,
                "src": frameData.src,
                "visible": false,
                "x": this.position.x,
                "y": this.position.y,
            },
            className: "Image"
        };
        return frame;
    }
}

export default CharacterFramesBuilder;
