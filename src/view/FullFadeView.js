import EventEmitter from "../events/EventEmitter.js";

class FullFadeView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Tween} fadeFull
     */
    constructor(uiEventEmitter, fadeFull) {
        this.uiEventEmitter = uiEventEmitter;
        this.fadeFull = fadeFull;

        // These can be fired via interactions
        this.uiEventEmitter.on('play_full_fade_out', () => {
            this.playFullFadeOut();
        });
        this.uiEventEmitter.on('play_full_fade_in', () => {
            this.playFullFadeIn();
        });
        // Respond to other UI events
        this.uiEventEmitter.on('play_sequence_started', (_id) => {
            this.playFullFadeOut();
        });
        this.uiEventEmitter.on('sequence_hid_previous_slide', () => {
            this.playFullFadeOut();
        });
        this.uiEventEmitter.on('sequence_last_slide_fade_out', (finalFadeDuration) => {
            this.playFullFadeCycleWithDuration(finalFadeDuration);
        });
        this.uiEventEmitter.on('sequence_last_slide_immediate', () => {
            this.handleSequenceLastSlideImmediate();
        });
        this.uiEventEmitter.on('sequence_show_next_slide_fade', () => {
            this.handleSequenceShowNextSlideFade();
        });
        this.uiEventEmitter.on('sequence_show_next_slide_immediate', () => {
            this.handleSequenceShowNextSlideImmediate();
        });
    }

    playFullFadeIn() {
        // Assumes fade_full has first faded out
        this.fadeFull.reverse();
        this.uiEventEmitter.emit('fader_total_occultation_ended');
        setTimeout(() => {
            this.fadeFull.node.hide();
            this.fadeFull.reset();
        }, this.fadeFull.tween.duration);
    }

    playFullFadeCycleWithDuration(duration) {
        this.fadeFull.tween.duration = duration;
        this.playFullFadeOut();

        setTimeout(() => {
            this.playFullFadeIn();
            setTimeout(() => {
                this.fadeFull.tween.duration = 600; // reset to default
            }, duration);
        }, duration);
    }

    handleSequenceShowNextSlideImmediate() {
        this.fadeFull.reset();
        this.uiEventEmitter.emit('fader_total_occultation_ended');
    }

    playFullFadeOut() {
        this.fadeFull.reset();
        this.fadeFull.node.show();
        this.fadeFull.play();
    }

    handleSequenceLastSlideImmediate() {
        this.fadeFull.node.hide();
        this.uiEventEmitter.emit('fader_total_occultation_ended');
    }

    handleSequenceShowNextSlideFade() {
        setTimeout(() => {
            this.playFullFadeIn();
        }, this.fadeFull.tween.duration);
    }
}

export default FullFadeView;
