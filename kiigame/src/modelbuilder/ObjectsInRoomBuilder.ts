import { ObjectModel } from '../model/schema/ObjectModelSchema';

export class ObjectsInRoomBuilder {
    private roomObjectCategories: string[];

    constructor(roomObjectCategories: string[]) {
        this.roomObjectCategories = roomObjectCategories;
    };

    build(roomJson: object): ObjectModel[] {
        const objectsInRoom: ObjectModel[] = [];
        for (const [category, objects] of Object.entries(roomJson) as [string, object][]) {
            if (this.roomObjectCategories.includes(category)) {
                for (const [name, objectData] of Object.entries(objects) as [string, any][]) {
                    const objectResult: ObjectModel = {
                        name,
                        category,
                        visible: objectData.initiallyVisible !== false,
                    };
                    objectsInRoom.push(objectResult);
                };
            }
        }
        return objectsInRoom;
    }
}

export default ObjectsInRoomBuilder;
