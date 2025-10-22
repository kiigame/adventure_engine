import { expect } from 'chai';
import RoomBuilder from './RoomBuilder.js';

describe('konva room builder tests', () => {
    const roomName = "roomy_room";
    describe('basic Konva attrs (id, visibility) and custom attrs (category, fullScreen)', () => {
        it('should set initial visibility to false, add id by json object key, and set category to room', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {};
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should add fullscreen flag to attrs if it\'s true', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = { "fullScreen": true };
            const expected = {
                "attrs": {
                    "fullScreen": true,
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should add fullscreen flag to attrs as false if it\'s false', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = { "fullScreen": false };
            const expected = {
                "attrs": {
                    "fullScreen": false,
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
    });
    describe('background image', () => {
        it('should set background image dimensions to the default room view size', () => {
            const roomBuilder = new RoomBuilder();
            const roomName = "roomy_room";
            const roomJson = {
                "background": {
                    "id": "roomy_room_bg",
                    "src": "data/images/locker_room_1.png"
                },
                "className": "Group"
            };
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "children": [
                    {
                        "attrs": {
                            "category": "room_background",
                            "id": "roomy_room_bg",
                            "src": "data/images/locker_room_1.png",
                            "visible": true,
                            "width": 981,
                            "height": 543
                        },
                        "className": "Image"
                    }
                ],
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should insert background as the first child of the room so that it will not cover furniture', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {
                "background": {
                    "id": "roomy_room_bg",
                    "src": "data/images/locker_room_1.png"
                },
                "children": [
                    {
                        "data": "mock_data"
                    }
                ],
                "className": "Group"
            };
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "children": [
                    {
                        "attrs": {
                            "category": "room_background",
                            "id": "roomy_room_bg",
                            "src": "data/images/locker_room_1.png",
                            "visible": true,
                            "width": 981,
                            "height": 543
                        },
                        "className": "Image"
                    },
                    {
                        "data": "mock_data"
                    }
                ],
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should handle rooms without background object in data gracefully', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {};
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should handle rooms with null background object in data gracefully', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {
                "background": null
            };
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should handle rooms with empty background object in data gracefully', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {
                "background": {}
            };
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                },
                "className": "Group"
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
    });
});
