import EventEmitter from "../../events/EventEmitter";

class CharacterAnimations {
    /**
     * @param {object} animations JSON object of player character animations
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
        this.gameEventEmitter = gameEventEmitter;

        // Overriding default speaking animation from setMonologue from the same
        // interaction assumes: setMonologue is called first, and that events get
        // fired and handled in the same order ...
        this.uiEventEmitter.on('play_character_speak_animation', ({ duration }) => {
            this.playCharacterAnimation(this.speakAnimationName, duration);
        });
        this.uiEventEmitter.on('play_character_animation', ({ animationName, duration }) => {
            this.playCharacterAnimation(animationName, duration);
        });
        this.uiEventEmitter.on('reset_character_animation', () => {
            this.startCharacterAnimation(this.idleAnimationName);
        });
        this.gameEventEmitter.on('set_idle_animation', (animation_id) => {
            this.setIdleAnimation(animation_id);
        });
        this.gameEventEmitter.on('set_speak_animation', (animation_id) => {
            this.setSpeakAnimation(animation_id);
        });
    }

    /**
     * Start a character animation by name.
     * @param {string} animationName
     */
    startCharacterAnimation(animationName) {
        // Hide and reset all character animations
        Object.values(this.animations).forEach((frames) => {
            frames.forEach((frame) => {
                frame.node.hide();
                frame.reset();
            });
        });
        const animation = this.animations[animationName];
        animation[0].node.show();
        animation[0].play();
        this.uiEventEmitter.emit('character_animation_started');
    }

    /**
     * Play a character animation once and reset to idle.
     * @param {*} animationName The name of the animation to play.
     * @param {*} duration The time in ms until the character returns to idle animation.
     */
    playCharacterAnimation(animationName, duration) {
        this.startCharacterAnimation(animationName);
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.uiEventEmitter.emit('reset_character_animation');
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
