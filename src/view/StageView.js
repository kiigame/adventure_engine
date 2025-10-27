import EventEmitter from "../events/EventEmitter.js";

class StageView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {Konva.Stage} stage
     */
    constructor(uiEventEmitter, stage) {
        this.stage = stage;

        // Capture Konva's UI events and transform to KiiGame UI event
        this.stage.on('touchstart mousedown', () => {
            uiEventEmitter.emit('clicked_on_stage');
        });
        // Respond to other UI events
        uiEventEmitter.on('fader_total_occultation_ended', () => {
            this.drawStage();
        });
        uiEventEmitter.on('room_hit_regions_initialized', () => {
            this.drawStage();
        });
    }

    drawStage() {
        this.stage.draw();
    }
}

export default StageView;
