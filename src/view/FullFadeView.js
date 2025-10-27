import EventEmitter from "../events/EventEmitter.js";

class FullFadeView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Layer} fader_full
     * @param {Konva.Tween} fade_full
     */
    constructor(uiEventEmitter, fader_full, fade_full) {
        this.uiEventEmitter = uiEventEmitter;
        this.fader_full = fader_full;
        this.fade_full = fade_full;

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
        this.fade_full.reverse();
        this.uiEventEmitter.emit('fader_total_occultation_ended');
        setTimeout(() => {
            this.fader_full.hide();
        }, this.fade_full.tween.duration);
    }

    playFullFadeCycleWithDuration(duration) {
        this.fade_full.tween.duration = duration;
        this.playFullFadeOut();

        setTimeout(() => {
            this.playFullFadeIn();
            setTimeout(() => {
                this.fade_full.tween.duration = 600; // reset to default
            }, duration);
        }, duration);
    }

    handleSequenceShowNextSlideImmediate() {
        this.fade_full.reset();
        this.uiEventEmitter.emit('fader_total_occultation_ended');
    }

    playFullFadeOut() {
        this.fade_full.reset();
        this.fader_full.show();
        this.fade_full.play();
    }

    handleSequenceLastSlideImmediate() {
        this.fader_full.hide();
        this.uiEventEmitter.emit('fader_total_occultation_ended');
    }

    handleSequenceShowNextSlideFade() {
        setTimeout(() => {
            this.playFullFadeIn();
        }, this.fade_full.tween.duration);
    }
}

export default FullFadeView;
