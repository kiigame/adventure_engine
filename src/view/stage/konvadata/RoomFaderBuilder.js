class RoomFaderBuilder {
    /**
     * @returns {*} JSON object with the konva data for the room fader Group
     */
    buildRoomFader() {
        return {
            "attrs": {
                "id": "fader_room",
                "opacity": 0,
                "visible": false
            },
            "children": [
                {
                    "attrs": {
                        "id": "black_screen_room",
                        "src": "data/images/black.png",
                    },
                    "className": "Image"
                }
            ],
            "className": "Group"
        };
    }
}

export default RoomFaderBuilder;
