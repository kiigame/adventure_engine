import { RoomChildrenBuilder } from './RoomChildrenBuilder.js';

type Furniture = {
    initiallyVisible?: boolean,
    attrs?: any,
};

export class FurnitureBuilder implements RoomChildrenBuilder {
    /**
     * Transform furniture data in to Konva object json.
     * @param {Furniture[]} furnitureJson furniture from room.json
     * @returns {object[]} an array of furniture as Konva objects
     */
    buildRoomChildren(furnitureJson: Furniture[]): object[] {
        const furnitureResult: object[] = [];
        for (const [key, furniture] of Object.entries(furnitureJson)) {
            if (!furniture.attrs) {
                furniture.attrs = {};
            }
            if (furniture.initiallyVisible !== undefined && furniture.initiallyVisible !== null) {
                furniture.attrs.visible = furniture.initiallyVisible;
                delete furniture.initiallyVisible;
            }

            const shape = {
                ...furniture,
                attrs: {
                    ...furniture.attrs,
                    id: key,
                    category: "furniture"
                }
             };
            furnitureResult.push(shape);
        }
        return furnitureResult;
    }
}
