import StageObjectGetter from "../../stage/StageObjectGetter";

class CharacterAnimationsBuilder {
    /**
     * @param {StageObjectGetter} stageObjectGetter
     */
    constructor(stageObjectGetter) {
        this.stageObjectGetter = stageObjectGetter;
    }

    /**
     * @param {object} characterAnimationData JSON object with animation data
     * @returns {object} JSON object with key, Konva.Tween pairs
     */
    build(characterAnimationData) {
        const characterAnimations = {};
        Object.entries(characterAnimationData).forEach(([id, animationDatum]) => {
            const frames = [];
            // Build Konva.Tween objects
            for (const frameDatum of animationDatum.frames) {
                // TODO: Refactor into a factory?
                const frame = new Konva.Tween({
                    node: this.stageObjectGetter.getObject(frameDatum.node),
                    duration: frameDatum.duration
                });
                frames.push(frame);
            }
            // Set up onFinish functions for each frame to show the next frame
            frames.forEach((frame) => {
                // Last frame loops back to the first frame
                const nextFrame = frames.length > frames.indexOf(frame) + 1
                    ? frames[frames.indexOf(frame) + 1]
                    : frames[0];
                frame.nextFrame = nextFrame;
                frame.onFinish = function () {
                    this.node.hide();
                    this.nextFrame.node.show();
                    this.reset();
                    this.nextFrame.play();
                }
            });
            characterAnimations[id] = frames;
        });
        return characterAnimations;
    }
}

export default CharacterAnimationsBuilder;
