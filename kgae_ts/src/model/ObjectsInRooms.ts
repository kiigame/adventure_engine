import { EventEmitter, ObjectModel } from "@kiigame/kgae_ts";

export type ObjectsInRoomsModel = Record<string, ObjectModel[]>;

export class ObjectsInRooms {
  private objectsInRoomsData: ObjectsInRoomsModel;
  private gameEventEmitter: EventEmitter;

  constructor(objectsInRoomsData: ObjectsInRoomsModel, gameEventEmitter: EventEmitter) {
    this.objectsInRoomsData = objectsInRoomsData;
    this.gameEventEmitter = gameEventEmitter;

    this.gameEventEmitter.on('remove_objects', (objectNames: string[]) => {
      this.removeObjects(objectNames);
    });
    this.gameEventEmitter.on('add_objects', (params: { objectNames: string[], roomId: string }) => {
      this.addObjects(params.objectNames, params.roomId);
    });
  }

  removeObjects(objectNames: string[]) {
    const removedObjectNames: string[] = [];
    // TODO: I'm sure there's a more elegant way than this!
    objectNames.forEach((objectName) => {
      for (const [room, objects] of Object.entries(this.objectsInRoomsData)) {
        for (const object of objects) {
          if (object.name === objectName) {
            this.objectsInRoomsData[room] = this.objectsInRoomsData[room].filter((obj) => obj.name !== objectName);
            removedObjectNames.push(object.name);
          }
        }
      }
    });
    this.gameEventEmitter.emit(
      'removed_objects',
      {
        'objectList': this.objectsInRoomsData,
        'objectsRemoved': removedObjectNames
      }
    );
  }

  addObjects(objectNames: string[], roomId: string) {
    const addedObjectNames: string[] = [];
    // TODO: I'm sure there's a more elegant way than this!
    objectNames.forEach((objectName) => {
      for (const [room, objects] of Object.entries(this.objectsInRoomsData)) {
        if (room === roomId && !objects.some((obj) => obj.name === objectName)) {
          this.objectsInRoomsData[room].push({ name: objectName });
          addedObjectNames.push(objectName);
        }
      }
    });
    this.gameEventEmitter.emit(
      'added_objects',
      {
        'objectList': this.objectsInRoomsData,
        'objectsAdded': addedObjectNames
      }
    );
  }
}
