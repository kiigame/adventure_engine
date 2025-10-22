import { expect, use } from 'chai';
import { createStubInstance } from 'sinon';
import sinonChai from "sinon-chai";
import RoomsBuilder from './RoomsBuilder.js';
import RoomBuilder from './RoomBuilder.js';
use(sinonChai);

describe('konva rooms builder tests', () => {
    let roomBuilder;
    beforeEach(() => {
        roomBuilder = createStubInstance(RoomBuilder);
    });
    it('should call RoomBuilder.build with expected values', () => {
        const roomsBuilder = new RoomsBuilder(roomBuilder);
        const roomsJson = [
            { "attrs": { "id": "first_room" } },
            { "attrs": { "id": "last_room" } }
        ];
        const expected = [
            { "attrs": { "id": "first_room" } },
            { "attrs": { "id": "last_room" } }
        ];
        roomsBuilder.build(roomsJson);
        expect(roomBuilder.build.getCall(0)).to.be.calledWith(expected[0]);
        expect(roomBuilder.build.getCall(1)).to.be.calledWith(expected[1]);
    });
    it('should return an array of the room builder results', () => {
        const roomsBuilder = new RoomsBuilder(roomBuilder);
        const roomsJson = [ 'firstInput', 'secondInput' ];
        const roomBuilderMockResults = [
            { "id": "firstOutput" },
            { "id": "secondOutput" }
        ];
        const expected = [
            { "id": "firstOutput" },
            { "id": "secondOutput" }
        ];
        roomBuilder.build.onCall(0).returns(roomBuilderMockResults[0]);
        roomBuilder.build.onCall(1).returns(roomBuilderMockResults[1]);
        const result = roomsBuilder.build(roomsJson);
        expect(result).deep.equals(expected);
    });
});
