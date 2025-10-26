import { expect, use } from 'chai';
import { createStubInstance, restore } from 'sinon';
import sinonChai from 'sinon-chai';
import RoomsBuilder from './RoomsBuilder.js';
import RoomBuilder from './RoomBuilder.js';
use(sinonChai);

describe('konva rooms builder tests', () => {
    let roomBuilder;
    beforeEach(() => {
        roomBuilder = createStubInstance(RoomBuilder);
    });
    afterEach(() => {
        restore();
    });
    it('should call RoomBuilder.build with expected values', () => {
        const roomsBuilder = new RoomsBuilder(roomBuilder);
        const roomsJson = {
            'first_room': { 'key': 'value_first' },
            'last_room': { 'key': 'value_last' }
        };
        const expectedNames = ['first_room', 'last_room'];
        const expectedJsonObjects = [{ 'key': 'value_first' }, { 'key': 'value_last' }];
        roomsBuilder.build(roomsJson);
        expect(roomBuilder.build.getCall(0)).to.be.calledWith(expectedNames[0], expectedJsonObjects[0]);
        expect(roomBuilder.build.getCall(1)).to.be.calledWith(expectedNames[1], expectedJsonObjects[1]);
    });
    it('should return an array of the room builder results', () => {
        const roomsBuilder = new RoomsBuilder(roomBuilder);
        // Only the number of datum in the input data matter for the scope of this test
        const roomsJson = { 'firstInput': {}, 'secondInput': {} };
        // Contents of the roombuilder.build output does not matter
        const roomBuilderMockResults = [
            { 'id': 'firstOutput' },
            { 'id': 'secondOutput' }
        ];
        const expected = [
            { 'id': 'firstOutput' },
            { 'id': 'secondOutput' }
        ];
        roomBuilder.build.onCall(0).returns(roomBuilderMockResults[0]);
        roomBuilder.build.onCall(1).returns(roomBuilderMockResults[1]);
        const result = roomsBuilder.build(roomsJson);
        expect(result).deep.equals(expected);
    });
});
