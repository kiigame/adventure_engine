import { StageObjectGetter } from "../../util/konva/StageObjectGetter.js";
import EventEmitter from "../../events/EventEmitter.js";
import Konva from 'konva';

class SequenceView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {StageObjectGetter} stageObjectGetter
     * @param {any} sequencesJson
     * @param {Konva.Layer} sequenceLayer
     */
    constructor(uiEventEmitter, gameEventEmitter, stageObjectGetter, sequencesJson, sequenceLayer) {
        this.uiEventEmitter = uiEventEmitter;
        this.stageObjectGetter = stageObjectGetter;
        this.sequencesJson = sequencesJson;
        this.sequenceLayer = sequenceLayer;

        this.uiEventEmitter.on('arrived_in_room', (_roomId) => {
            this.sequenceLayer.hide();
        });
        gameEventEmitter.on('play_sequence', (sequenceId) => {
            this.playSequence(sequenceId);
        });
    }

    /**
     * Playes a sequence definied in sequences.json by id.
     * @param {string} id The Sequence id in sequences.json
     */
    playSequence(id) {
        let delay = 700;

        this.uiEventEmitter.emit('play_sequence_started', id);

        const currentSequence = this.stageObjectGetter.getObject(id);
        const sequenceData = this.sequencesJson[id];
        const final_fade_duration = sequenceData.transition_length != null ? sequenceData.transition_length : 0;
        let currentSlide = null;

        setTimeout(() => {
            this.sequenceLayer.show();
            currentSequence.show();
            this.uiEventEmitter.emit('first_sequence_slide_shown');
        }, delay);

        for (let i in sequenceData.slides) {
            let previousSlide = currentSlide;
            currentSlide = this.stageObjectGetter.getObject(sequenceData.slides[i].id);

            const displaySlide = (i, currentSlide, previousSlide) => {
                setTimeout(() => {
                    if (previousSlide) {
                        previousSlide.hide();
                        this.uiEventEmitter.emit('sequence_hid_previous_slide');
                    }

                    // Show current slide (note stage.draw only below)
                    currentSlide.show();

                    // Fade in?
                    const slideFade = sequenceData.slides[i].do_fade;
                    if (slideFade === true) {
                        this.uiEventEmitter.emit('sequence_show_next_slide_fade');
                    } else {
                        this.uiEventEmitter.emit('sequence_show_next_slide_immediate');
                    }
                }, delay);
            }
            displaySlide(i, currentSlide, previousSlide);

            delay = delay + sequenceData.slides[i].show_time;
        };

        // After last slide, do the final fade
        if (final_fade_duration > 0) {
            setTimeout(() => {
                this.uiEventEmitter.emit('sequence_last_slide_fade_out', final_fade_duration);
            }, delay);

            // Doesn't include the fade-in!
            delay = delay + final_fade_duration;
        } else {
            setTimeout(() => {
                this.uiEventEmitter.emit('sequence_last_slide_immediate');
            }, delay);
        }
    }
}

export default SequenceView;
