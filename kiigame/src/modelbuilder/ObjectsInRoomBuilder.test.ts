import { expect } from 'chai';
import { ObjectsInRoomBuilder } from './ObjectsInRoomBuilder.js';
import { ObjectModel } from 'model/schema/ObjectModelSchema.js';

describe('konva room builder tests', () => {
    it('should build a room with objects with given types', () => {
        const objectsInRoomBuilder = new ObjectsInRoomBuilder(['type','other_type']);
        const roomJson = {
            'type': {
                'object_1': {
                    'initiallyVisible': true,
                },
                'object_2': {
                    'initiallyVisible': true,
                }
            },
            'ignored_type': {
                'non_object': {
                    'initiallyVisible': true,
                }
            },
            'other_type': {
                'object_3': {
                    'initiallyVisible': true,
                }
            }
        };
        const expected: ObjectModel[] = [
            {
                name: "object_1",
                category: "type",
            },
            {
                name: "object_2",
                category: "type",
            },
            {
                name: "object_3",
                category: "other_type",
            }
        ];
        const result = objectsInRoomBuilder.build(roomJson);
        expect(result).to.deep.equal(expected);
    });
    it('should not add a random field to object data', () => {
        const objectsInRoomBuilder = new ObjectsInRoomBuilder(['type']);
        const roomJson = {
            'type': {
                'object_1': {
                    'initiallyVisible': true,
                    'field_to_ignore': 'value_to_ignore'
                },
            },
        };
        const expected: ObjectModel[] = [
            {
                name: "object_1",
                category: "type",
            }
        ];
        const result = objectsInRoomBuilder.build(roomJson);
        expect(result).to.deep.equal(expected);
    });
    it('should add object to room if it\'s missing initiallyVisible (treat as true)', () => {
        const objectsInRoomBuilder = new ObjectsInRoomBuilder(['type']);
        const roomJson = {
            'type': {
                'object_1': {}
            }
        };
        const expected: ObjectModel[] = [
            {
                name: "object_1",
                category: "type",
            }
        ];
        const result = objectsInRoomBuilder.build(roomJson);
        expect(result).to.deep.equal(expected);
    });
    it('should only add objects to room if they are initiallyVisible', () => {
        const objectsInRoomBuilder = new ObjectsInRoomBuilder(['type']);
        const roomJson = {
            'type': {
                'object_1': {
                    'initiallyVisible': true,
                },
                'object_2': {
                    'initiallyVisible': false,
                }
            }
        };
        const expected: ObjectModel[] = [
            {
                name: "object_1",
                category: "type",
            }
        ];
        const result = objectsInRoomBuilder.build(roomJson);
        expect(result).to.deep.equal(expected);
    });
});
