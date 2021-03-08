/**
 * Initialize hit regions in the stage.
 */
class HitRegionInitializer {
    constructor() {
    }

    initHitRegions(engine, stage)
    {
        stage.getChildren().each((o) => {
            if (o.getAttr('category') == 'room') {
                o.getChildren().each((shape, i) => {
                    if (shape.getAttr('category') != 'secret' && shape.className == 'Image') {
                        shape.cache();
                        shape.drawHitFromCache();
                    }
                });

                o.on('mouseup touchend', (event) => {
                    engine.handle_click(event);
                });
            }
        });
    }
}

export default HitRegionInitializer;
