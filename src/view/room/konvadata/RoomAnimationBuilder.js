import pkg from 'konva';
const { Tween } = pkg;

class RoomAnimationBuilder {
    /**
     * @param {*} object Konva Image object which has some extra data to create a Tween from
     * @returns {Tween}
     */
    createRoomAnimation(object) {
        const attrs = object.getAttr("animation");
        const animation = new Tween({
            node: object,
            x: attrs.x ? object.x() + attrs.x : object.x(),
            y: attrs.y ? object.y() + attrs.y : object.y(),
            width: attrs.width ? object.width() - 15 : object.width(),
            easing: Konva.Easings.EaseInOut,
            duration: attrs.duration,

            onFinish: () => {
                animation.reverse();
                setTimeout(() => {
                    animation.play();
                }, attrs.duration * 1000);
            }
        });

        return animation;
    }
}

export default RoomAnimationBuilder;
