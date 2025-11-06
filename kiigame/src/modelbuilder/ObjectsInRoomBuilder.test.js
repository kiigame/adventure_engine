import { expect } from 'chai';
import ObjectsInRoomBuilder from './ObjectsInRoomBuilder.js';

describe('konva room builder tests', () => {
    it('should build a objects with given types', () => {
        const objectsInRoomBuilder = new ObjectsInRoomBuilder(['type','other_type']);
        const roomJson = {
            'type': {
                'object_1': {
                    'initiallyVisible': true,
                    'field_to_ignore': 'value_to_ignore'
                },
                'object_2': {
                    'initiallyVisible': false,
                    'field_to_ignore': 'value_to_ignore'
                }
            },
            'ignored_type': {
                'non_object': {
                    'initiallyVisible': true,
                    'field_to_ignore': 'value_to_ignore'
                }
            },
            'other_type': {
                'object_3': {
                    'initiallyVisible': true,
                    'field_to_ignore': 'value_to_ignore'
                }
            }
        };
        const expected = {
            "object_1": {
                "category": "type",
                "visible": true
            },
            "object_2": {
                "category": "type",
                "visible": false
            },
            "object_3": {
                "category": "other_type",
                "visible": true
            }
        };
        const result = objectsInRoomBuilder.build(roomJson);
        expect(result).to.deep.equal(expected);
    });
    it('should set missing initiallyVisible as true', () => {
        const objectsInRoomBuilder = new ObjectsInRoomBuilder(['type']);
        const roomJson = {
            'type': {
                'object_1': {
                    'field_to_ignore': 'value_to_ignore'
                }
            }
        };
        const expected = {
            "object_1": {
                "category": "type",
                "visible": true
            }
        }
        const result = objectsInRoomBuilder.build(roomJson);
        expect(result).to.deep.equal(expected);
    });
});
