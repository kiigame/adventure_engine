import { expect } from 'chai';
import RoomBuilder from './RoomBuilder.js';

describe('konva room builder tests', () => {
    const roomName = "roomy_room";
    describe('visibility', () => {
        it('should set initial visibility to false', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {
                "attrs": {
                    "category": "room",
                }
            };
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                }
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
                "attrs": {
                    "category": "room",
                },
                "background": {
                    "id": "roomy_room_bg",
                    "src": "data/images/locker_room_1.png"
                }
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
                ]
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should insert background as the first child of the room so that it will not cover furniture', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {
                "attrs": {
                    "category": "room",
                },
                "background": {
                    "id": "roomy_room_bg",
                    "src": "data/images/locker_room_1.png"
                },
                "children": [
                    {
                        "data": "mock_data"
                    }
                ]
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
                ]
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should handle rooms without background object in data gracefully', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {
                "attrs": {
                    "category": "room",
                }
            };
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                }
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should handle rooms with null background object in data gracefully', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {
                "attrs": {
                    "category": "room",
                },
                "background": null
            };
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                }
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
        it('should handle rooms with empty background object in data gracefully', () => {
            const roomBuilder = new RoomBuilder();
            const roomJson = {
                "attrs": {
                    "category": "room",
                },
                "background": {}
            };
            const expected = {
                "attrs": {
                    "category": "room",
                    "id": "roomy_room",
                    "visible": false
                }
            };
            const result = roomBuilder.build(roomName, roomJson);
            expect(result).to.deep.equal(expected);
        });
    });
});
