import EventEmitter from "../../events/EventEmitter.js";
import HitRegionFilter from "./hitregion/HitRegionFilter.js";

/**
 * Initialize hit regions in the stage.
 */
class HitRegionInitializer {
    /**
     * @param {HitRegionFilter} hitRegionFilter
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(hitRegionFilter, uiEventEmitter) {
        this.hitRegionFilter = hitRegionFilter;
        this.uiEventEmitter = uiEventEmitter;
    }

    initHitRegions(roomLayer)
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
                    this.uiEventEmitter.emit('furniture_clicked', event.target);
                });
            }
        });
    }
}

export default HitRegionInitializer;
