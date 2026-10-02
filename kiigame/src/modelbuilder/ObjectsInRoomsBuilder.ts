import { ObjectsInRoomsModel } from "@kiigame/kgae_ts";
import { ObjectsInRoomBuilder } from "./ObjectsInRoomBuilder";

export class ObjectsInRoomsBuilder {
    private objectsInRoomBuilder: ObjectsInRoomBuilder;

    constructor(objectsInRoomBuilder: ObjectsInRoomBuilder) {
        this.objectsInRoomBuilder = objectsInRoomBuilder;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    build(roomsJson: any): ObjectsInRoomsModel {
        const objectsInRoomsData: ObjectsInRoomsModel = {};
        for (const [name, room] of Object.entries(roomsJson)) {
            objectsInRoomsData[name] = this.objectsInRoomBuilder.build(room as object);
        };
        return objectsInRoomsData;
    }
}
