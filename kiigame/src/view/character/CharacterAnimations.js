import { EventEmitter } from "../../events/EventEmitter.js";

class CharacterAnimations {
    /**
     * @param {object} animations a list of character animations (Konva.Tween objects) by name
     * @param {object} postureMapping a mapping of character postures to animation names
     * @param {object} monologuePostureMapping a mapping of character postures to animation names for monologues
     * @param {object} npcMonologuePostureMapping a mapping of character postures to animation names for NPC monologues
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     */
    constructor(animations, postureMapping, monologuePostureMapping, npcMonologuePostureMapping, uiEventEmitter, gameEventEmitter) {
        // List of character animations.
        this.animations = animations;
        // Posture mapping for character animations
        this.postureMapping = postureMapping;
        this.monologuePostureMapping = monologuePostureMapping;
        this.npcMonologuePostureMapping = npcMonologuePostureMapping;
        // Timeout event for showing character animation for certain duration
        this.timeout;
        // Default character animations
        this.speakAnimationName = "speak";
        this.idleAnimationName = "idle";

        this.uiEventEmitter = uiEventEmitter;
        gameEventEmitter = gameEventEmitter;

        gameEventEmitter.on('monologue', ({ text: _text, posture }) => {
            const defaultAnimationLength = 3000; // hardcoded default
            if (!posture) {
                this.playCharacterAnimation(this.speakAnimationName, defaultAnimationLength);
                return;
            }
            const animationName = this.monologuePostureMapping[posture] || this.speakAnimationName;
            this.playCharacterAnimation(animationName, defaultAnimationLength);
        });
        gameEventEmitter.on('npc_monologue', ({ _npc, _text, characterPosture }) => {
            if (!characterPosture) {
                return;
            }
            const defaultAnimationLength = 3000; // hardcoded default
            const animationName = this.npcMonologuePostureMapping[characterPosture] || this.idleAnimationName;
            this.playCharacterAnimation(animationName, defaultAnimationLength);
        });
        this.uiEventEmitter.on('clicked_on_stage', () => {
            this.resetCharacterAnimations();
        });
        this.uiEventEmitter.on('inventory_item_drag_start', ({ draggedItem: _draggedItem }) => {
            this.resetCharacterAnimations();
        });
        gameEventEmitter.on('character_posture_changed', (posture) => {
            const idleAnimationName = this.postureMapping[posture].idle || this.idleAnimationName;
            this.setIdleAnimation(idleAnimationName);
            const speakAnimationName = this.postureMapping[posture].speak || this.speakAnimationName;
            this.setSpeakAnimation(speakAnimationName);
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
