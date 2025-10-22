import { expect } from 'chai';
import RoomBuilder from './RoomBuilder.js';

describe('konva room builder tests', function () {
    it('test visibility is set to false the room', function () {
        const roomBuilder = new RoomBuilder();
        const roomJson = {
        "attrs": {
            "category": "room",
            "id": "roomy_room"
        }};
        const expected = {
            "attrs": {
                "category": "room",
                "id": "roomy_room",
                "visible": false
            }
        };
        const result = roomBuilder.build(roomJson);
        expect(result).to.deep.equal(expected);
    });
});
