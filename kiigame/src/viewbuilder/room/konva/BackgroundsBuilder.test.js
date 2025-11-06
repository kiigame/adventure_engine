import { expect } from 'chai';
import BackgroundsBuilder from './BackgroundsBuilder.js';

describe('room backgrounds builder tests', () => {
    it('should set background image dimensions to the default room view size', () => {
        const backgroundsBuilder = new BackgroundsBuilder();
        const backgroundsJson = {
            "roomy_room_bg": {
                "src": "data/images/locker_room_1.png"
            }
        };
        const expected = [
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
        ];
        const result = backgroundsBuilder.buildRoomChildren(backgroundsJson);
        expect(result).to.deep.equal(expected);
    });
});
