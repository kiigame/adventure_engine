class RoomFader {
    constructor(faderNode, animation, uiEventEmitter, gameEventEmitter) {
        this.faderNode = faderNode;
        this.animation = animation;
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;

        this.gameEventEmitter.on('leaving_room', () => {
            this.roomFadeOut();
        });
        this.gameEventEmitter.on('arriving_in_room', () => {
            this.roomFadeIn();
        });
    }

    roomFadeOut() {
        this.faderNode.show();
        this.animation.play();
        setTimeout(() => {
            this.uiEventEmitter.emit('room_fade_out_done');
        }, this.animation.tween.duration);
    }

    roomFadeIn() {
        this.animation.reverse();
        setTimeout(() => {
            this.faderNode.hide();
            this.uiEventEmitter.emit('room_fade_in_done');
        }, this.animation.tween.duration);
    }
}

export default RoomFader;
