import EventEmitter from "../../events/EventEmitter.js";

class CharacterAnimations {
    /**
     * @param {object} animations a list of character animations (Konva.Tween objects) by name
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     */
    constructor(animations, uiEventEmitter, gameEventEmitter) {
        // List of character animations.
        this.animations = animations;
        // Timeout event for showing character animation for certain duration
        this.timeout;
        // Default character animations
        this.speakAnimationName = "speak";
        this.idleAnimationName = "idle";

        this.uiEventEmitter = uiEventEmitter;
        gameEventEmitter = gameEventEmitter;

        // Overriding default speaking animation from setMonologue from the same
        // interaction assumes: setMonologue is called first, and that events get
        // fired and handled in the same order ...
        gameEventEmitter.on('monologue', (_text) => {
            this.playCharacterAnimation(this.speakAnimationName, 3000); // hardcoded default
        });
        this.uiEventEmitter.on('play_character_animation', ({ animationName, duration }) => {
            this.playCharacterAnimation(animationName, duration);
        });
        this.uiEventEmitter.on('clicked_on_stage', () => {
            this.resetCharacterAnimations();
        });
        this.uiEventEmitter.on('inventory_item_drag_start', ({ draggedItem: _draggedItem }) => {
            this.resetCharacterAnimations();
        });
        gameEventEmitter.on('set_idle_animation', (animation_id) => {
            this.setIdleAnimation(animation_id);
        });
        gameEventEmitter.on('set_speak_animation', (animation_id) => {
            this.setSpeakAnimation(animation_id);
        });
    }

    /**
     * A little helper function for semantic clarity. Reset character animation to the idle animation.
     */
    resetCharacterAnimations() {
        this.startCharacterAnimation(this.idleAnimationName);
    }

    /**
     * A helper function to reset a single animation frame; for ease of unit testing.
     * @param {Konva.Tween} frame
     */
    resetAnimationFrame(frame) {
        frame.node.hide();
        frame.reset();
    }

    /**
     * A helper function to play the first frame of an animation; for ease of unit testing.
     * @param {Konva.Tween} frame
     */
    playAnimationFrame(frame) {
        frame.node.show();
        frame.play();
    }

    /**
     * Start a character animation by name.
     * @param {string} animationName
     */
    startCharacterAnimation(animationName) {
        // Hide and reset all character animations
        Object.values(this.animations).forEach((frames) => {
            frames.forEach((frame) => {
                this.resetAnimationFrame(frame);
            });
        });
        const animation = this.animations[animationName];
        this.playAnimationFrame(animation[0]);
        this.uiEventEmitter.emit('character_animation_started');
    }

    /**
     * Play a character animation once and reset to idle.
     * @param {string} animationName The name of the animation to play.
     * @param {int} duration The time in ms until the character returns to idle animation.
     */
    playCharacterAnimation(animationName, duration) {
        this.startCharacterAnimation(animationName);
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.startCharacterAnimation(this.idleAnimationName);
        }, duration);
    }

    /**
     * Change the idle animation, so that character graphics can be changed mid-game.
     * @param {string} animationName
     */
    setIdleAnimation(animationName) {
        this.idleAnimationName = animationName;
        this.startCharacterAnimation(this.idleAnimationName);
    }

    /**
     * Change the speak animation, so that character graphics can be changed mid-game.
     * @param {string} animationName
     */
    setSpeakAnimation(animationName) {
        this.speakAnimationName = animationName;
        this.startCharacterAnimation(this.idleAnimationName);
    }
}

export default CharacterAnimations;
