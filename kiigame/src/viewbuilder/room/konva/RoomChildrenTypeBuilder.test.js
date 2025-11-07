import { expect, use } from 'chai';
import { stub, restore } from 'sinon';
import sinonChai from "sinon-chai";
import RoomChildrenTypeBuilder from './RoomChildrenTypeBuilder.js';
use(sinonChai);

describe('room children type builder tests', () => {
    let roomChildrenBuilder;
    beforeEach(() => {
        // mock duck - room children builders should implement buildRoomChildren
        roomChildrenBuilder = {
            buildRoomChildren: () => {}
        };
        stub(
            roomChildrenBuilder, "buildRoomChildren"
        ).returns(
            ['first_child', 'middle_child', 'last_child']
        );
    });
    afterEach(() => {
        restore();
    });
    it('should add children to empty children', () => {
        const roomBuilder = new RoomChildrenTypeBuilder('type', roomChildrenBuilder);
        const roomJson = { 'type': { 'foobar_key': 'foobar_value' }, 'children': [] };
        const expected = { 'children': ['first_child', 'middle_child', 'last_child'] };
        const result = roomBuilder.addChildren(roomJson);
        expect(result).to.deep.equal(expected);
    });
    it('should append children to existing children', () => {
        const roomBuilder = new RoomChildrenTypeBuilder('type', roomChildrenBuilder);
        const roomJson = {
            'type': { 'foobar_key': 'foobar_value' },
            'children': ['existing_first_child', 'existing_second_child']
        };
        const expected = { 'children': [
            'existing_first_child', 'existing_second_child', 'first_child', 'middle_child', 'last_child'
        ] };
        const result = roomBuilder.addChildren(roomJson);
        expect(result).to.deep.equal(expected);
    });
    it('should handle rooms without child type object in data gracefully', () => {
        const roomBuilder = new RoomChildrenTypeBuilder('type', roomChildrenBuilder);
        const roomJson = { 'children': [] };
        const expected = { 'children': [] };
        const result = roomBuilder.addChildren(roomJson);
        expect(result).to.deep.equal(expected);
        expect(roomChildrenBuilder.buildRoomChildren).to.not.have.been.called; // already implicit from the result
    });
    it('should handle rooms with null child type object in data gracefully', () => {
        const roomBuilder = new RoomChildrenTypeBuilder('type', roomChildrenBuilder);
        const roomJson = {
            'type': null,
            'children': []
        };
        const expected = { 'children': [] };
        const result = roomBuilder.addChildren(roomJson);
        expect(result).to.deep.equal(expected);
        expect(roomChildrenBuilder.buildRoomChildren).to.not.have.been.called; // already implicit from the result
    });
    it('should handle rooms with empty child type object in data gracefully', () => {
        const roomBuilder = new RoomChildrenTypeBuilder('type', roomChildrenBuilder);
        const roomJson = {
            'type': {},
            'children': []
        };
        const expected = { 'children': [] };
        const result = roomBuilder.addChildren(roomJson);
        expect(result).to.deep.equal(expected);
        expect(roomChildrenBuilder.buildRoomChildren).to.not.have.been.called; // already implicit from the result
    });
});
