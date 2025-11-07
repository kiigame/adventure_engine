/**
 * Quacks like a "RoomChildrenBuilder" (for RoomChildrenTypeBuilder) - implements a buildRoomChildren method
 */
class BackgroundsBuilder {
    /**
     * Build Konva-ready json data from background data in rooms.json. The engine only supports one backgorund
     * image for a room, but from data we technically can build multiple.
     *
     * @param {object} backgroundsJson background json objects from rooms.json
     * @returns {object[]} array of backgrounds as Konva object jsons
     */
    buildRoomChildren(backgroundsJson) {
        // TODO: make configurable / responsive / etc / etc
        const bgWidth = 981;
        const bgHeight = 543;

        const backgrounds = [];
        for (const [key, backgroundJson] of Object.entries(backgroundsJson)) {
            const background = {};
            background.attrs = {
                "category": "room_background",
                "id": key,
                "src": backgroundJson.src,
                "visible": true,
                "width": bgWidth,
                "height": bgHeight
            };
            background.className = "Image";
            backgrounds.push(background);
        }
        return backgrounds;
    }
}

export default BackgroundsBuilder;
