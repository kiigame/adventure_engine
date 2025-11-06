import { expect, use } from 'chai';
import { createStubInstance } from 'sinon';
import sinonChai from 'sinon-chai';
import ObjectsInRoomsBuilder from './ObjectsInRoomsBuilder.js';
import ObjectsInRoomBuilder from './ObjectsInRoomBuilder.js';
use(sinonChai);

describe('objects in rooms builder tests', () => {
    let objectsInRoomBuilder;
    beforeEach(() => {
        objectsInRoomBuilder = createStubInstance(ObjectsInRoomBuilder);
    });
    it('should call ObjectsInRoomBuilder.build with expected values', () => {
        const objectsInRoomsBuilder = new ObjectsInRoomsBuilder(objectsInRoomBuilder);
        const roomsJson = {
            'first_room': { 'key': 'value_first' },
            'last_room': { 'key': 'value_last' }
        };
        const expectedJsonObjects = [{ 'key': 'value_first' }, { 'key': 'value_last' }];
        objectsInRoomsBuilder.build(roomsJson);
        expect(objectsInRoomBuilder.build.getCall(0)).to.be.calledWith(expectedJsonObjects[0]);
        expect(objectsInRoomBuilder.build.getCall(1)).to.be.calledWith(expectedJsonObjects[1]);
    });
    it('should return an object of the room builder results with room names as keys', () => {
        const objectsInRoomsBuilder = new ObjectsInRoomsBuilder(objectsInRoomBuilder);
        // Only the number of datum in the input data matter for the scope of this test
        const roomsJson = {
            'first_room': { 'key': 'value_first' },
            'last_room': { 'key': 'value_last' }
        };
        // Contents of the roombuilder.build output does not matter
        const roomBuilderMockResults = [
            { 'value': 'firstOutput' },
            { 'value': 'secondOutput' }
        ];
        const expected = {
            'first_room': { 'value': 'firstOutput' },
            'last_room': { 'value': 'secondOutput' }
        };
        objectsInRoomBuilder.build.onCall(0).returns(roomBuilderMockResults[0]);
        objectsInRoomBuilder.build.onCall(1).returns(roomBuilderMockResults[1]);
        const result = objectsInRoomsBuilder.build(roomsJson);
        expect(result).deep.equals(expected);
    });
});
