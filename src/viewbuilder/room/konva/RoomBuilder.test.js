import { expect } from 'chai';
import { createStubInstance, restore } from 'sinon';
import RoomBuilder from './RoomBuilder.js';
import RoomChildrenTypeBuilder from './RoomChildrenTypeBuilder.js';

describe('konva room builder tests', () => {
    const roomName = "roomy_room";
    describe('basic Konva attrs (id, visibility) and custom attrs (category, fullScreen)', () => {
        let roomChildrenTypeBuilder;
        beforeEach(() => {
            roomChildrenTypeBuilder = createStubInstance(RoomChildrenTypeBuilder);
            roomChildrenTypeBuilder.addChildren.returnsArg(0); // return the roomJson unmodified
        });
        afterEach(() => {
            restore();
        });
        it('should set initial visibility to false, add id by json object key, and set category to room', () => {
            const roomBuilder = new RoomBuilder([roomChildrenTypeBuilder]);
            const roomJson = {};
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "children": [],
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should add fullscreen flag to attrs if it\'s true', () => {
            const roomBuilder = new RoomBuilder([roomChildrenTypeBuilder]);
            const roomJson = { "fullScreen": true };
            const expected = {
                "attrs": {
                    "fullScreen": true,
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "children": [],
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should add fullscreen flag to attrs as false if it\'s false', () => {
            const roomBuilder = new RoomBuilder([roomChildrenTypeBuilder]);
            const roomJson = { "fullScreen": false };
            const expected = {
                "attrs": {
                    "fullScreen": false,
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "children": [],
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
    });
    describe('order of children', () => {
        let firstRoomChildrenTypeBuilder;
        let lastRoomChildrenTypeBuilder;
        beforeEach(() => {
            firstRoomChildrenTypeBuilder = createStubInstance(RoomChildrenTypeBuilder);
            lastRoomChildrenTypeBuilder = createStubInstance(RoomChildrenTypeBuilder);
        });
        afterEach(() => {
            restore();
        });
        it('should insert first children builder result first so that e.g. backgrounds will not cover furniture', () => {
            // Fairly annoying stubbing to mimick RoomChildrenTypeBuilder
            firstRoomChildrenTypeBuilder.addChildren.withArgs(
                {
                    "attrs": {
                        "category": "room",
                        "id": "roomy_room",
                        "visible": false
                    },
                    "children": []
                }
            ).returns(
                {
                    "attrs": {
                        "category": "room",
                        "id": "roomy_room",
                        "visible": false
                    },
                    "children": ['first_children']
                }
            );
            lastRoomChildrenTypeBuilder.addChildren.withArgs(
                {
                    "attrs": {
                        "category": "room",
                        "id": "roomy_room",
                        "visible": false
                    },
                    "children": ['first_children']
                }
            ).returns(
                {
                    "attrs": {
                        "category": "room",
                        "id": "roomy_room",
                        "visible": false
                    },
                     "children": ['first_children', 'last_children']
                }
            );
            const roomBuilder = new RoomBuilder([
                firstRoomChildrenTypeBuilder,
                lastRoomChildrenTypeBuilder
            ]);
            const roomJson = {}; // input data doesn't matter in this test
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "children": [
                    'first_children',
                    'last_children'
                ],
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
    });
});
