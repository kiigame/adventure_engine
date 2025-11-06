import { EventEmitter } from "../../events/EventEmitter.js";
import { HitRegionFilter } from "./hitregion/HitRegionFilter.js";
import Konva from 'konva';

/**
 * Initialize hit regions in the stage.
 */
export class HitRegionInitializer {
    private hitRegionFilter: HitRegionFilter;
    private uiEventEmitter: EventEmitter;

    /**
     * @param {HitRegionFilter} hitRegionFilter
     * @param {EventEmitter} uiEventEmitter
     */
    constructor(hitRegionFilter: HitRegionFilter, uiEventEmitter: EventEmitter) {
        this.hitRegionFilter = hitRegionFilter;
        this.uiEventEmitter = uiEventEmitter;
    }

    initHitRegions(roomLayer: Konva.Layer)
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
