/**
 * Initialize hit regions in the stage.
 */
class HitRegionInitializer {
    constructor(hitRegionFilter) {
        this.hitRegionFilter = hitRegionFilter;
    }

    initHitRegions(engine, roomLayer)
    {
        roomLayer.getChildren().each((o) => {
            if (o.getAttr('category') == 'room') {
                o.getChildren().each((shape, i) => {
                    if (this.hitRegionFilter.filter(shape)) {
                        try {
                            shape.cache();
                            shape.drawHitFromCache();
                        } catch (e) {
                            console.error(`Error processing hit region for shape ${shape.attrs.id}`);
                            throw e;
                        }
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
