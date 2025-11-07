import Konva from "konva";
import { EventEmitter } from "../../events/EventEmitter.js";
import { HitRegionInitializer } from "./HitRegionInitializer.js";

class RoomView {
    /**
     * @param {EventEmitter} uiEventEmitter
     * @param {EventEmitter} gameEventEmitter
     * @param {HitRegionInitializer} hitRegionInitializer
     * @param {Konva.Layer} roomLayer
     * @param {string[]} roomObjectCategories
     */
    constructor(uiEventEmitter, gameEventEmitter, hitRegionInitializer, roomLayer, roomObjectCategories = ['furniture']) {
        this.uiEventEmitter = uiEventEmitter;
        this.gameEventEmitter = gameEventEmitter;
        this.hitRegionInitializer = hitRegionInitializer;
        // The Konva room layer
        this.roomLayer = roomLayer;
        this.roomObjectCategories = roomObjectCategories;
        // The current room view
        this.currentRoom = null;

        // On window load we create image hit regions for furniture in rooms
        window.onload = () => {
            this.hitRegionInitializer.initHitRegions(this.roomLayer);
            this.uiEventEmitter.emit('room_hit_regions_initialized');
        };
        this.uiEventEmitter.on('inventory_item_drag_start', ({ draggedItem }) => {
            this.moveItemToRoomLayer(draggedItem);
        });
        this.uiEventEmitter.on('dragmove_hover_on_object', ({ target, draggedItem: _draggedItem, targetName: _targetName }) => {
            this.clearRoomObjectBlur();
            this.glowRoomObject(target);
            this.drawRoomLayer();
        });
        this.uiEventEmitter.on('dragmove_hover_on_nothing', () => {
            this.clearRoomObjectBlur();
            this.drawRoomLayer();
        });
        this.uiEventEmitter.on('inventory_item_drag_end_wrapped_up', (_draggedItem) => {
            this.clearRoomObjectBlur();
        });
        this.uiEventEmitter.on('room_fade_in_done', () => {
            this.drawRoomLayer();
        });
        this.uiEventEmitter.on('inventory_redrawn', () => {
            this.drawRoomLayer();
        });
        this.uiEventEmitter.on('left_room', (from) => {
            this.hidePreviousRoom(from);
        });
        this.uiEventEmitter.on('arrived_in_room', (roomId) => {
            this.showRoom(roomId);
        });
        this.uiEventEmitter.on('npc_monologue_set', () => {
            this.drawRoomLayer();
        });
        this.uiEventEmitter.on('npc_monologue_cleared', () => {
            this.drawRoomLayer();
        });

        this.gameEventEmitter.on('removed_objects', ({ objectList: _objectList, objectsRemoved }) => {
            this.removeObject(objectsRemoved);
        });
        this.gameEventEmitter.on('added_objects', ({ objectList: _objectList, objectsAdded }) => {
            this.addObject(objectsAdded);
        });
    }

    /**
     * @param {Konva.Node} node
     * @param {string[]} categories
     * @returns {boolean}
     */
    matchNodeByCategories(node, categories) {
        return categories.includes(node.attrs.category);
    }

    matchNodeById(node, id) {
        return node.attrs.id === id;
    }

    /**
     * @returns {Konva.Group[]} rooms as Konva objects
     */
    getRooms() {
        return this.roomLayer.getChildren((child) => this.matchNodeByCategories(child, ['room']));
    }

    /**
     * Return room by room id.
     *
     * @param {string} roomId
     * @returns  {Konva.Group} room as Konva object
     */
    getRoom(roomId) {
        const result = this.roomLayer.findOne((child) =>
            this.matchNodeByCategories(child, ['room']) && this.matchNodeById(child, roomId)
        );
        return result;
    }

    /**
     * @param {Konva.Group} room
     * @param {string} id
     * @returns {Konva.Shape} furniture
     */
    getObjectFromRoom(room, id) {
        return room.findOne((child) =>
            this.matchNodeByCategories(child, this.roomObjectCategories) && this.matchNodeById(child, id)
        );
    }

    /**
     * @param {Konva.Group} room
     * @returns {Konva.Shape[]} all furniture in the room
     */
    getObjectsFromRoom(room) {
        return room.find((child) => this.matchNodeByCategories(child, this.roomObjectCategories));
    }

    /**
     * @returns {Konva.Shape[]} all furniture in the current room
     */
    getObjectsFromCurrentRoom() {
        return this.getObjectsFromRoom(this.currentRoom);
    }

    /**
     * @param {Konva.Group} room
     * @returns {Konva.Shape[]} visible objects in the room
     */
    getVisibleObjectsFromRoom(room) {
        return room.find((child) =>
            this.matchNodeByCategories(child, this.roomObjectCategories) && child.isVisible()
        );
    }

    /**
     * @returns {Konva.Shape[]} visible objects in the current room
     */
    getVisibleObjectsFromCurrentRoom() {
        return this.getVisibleObjectsFromRoom(this.currentRoom);
    }

    /**
     * @param {name} objectId
     * @returns {Konva.Image} furniture
     */
    getObject(objectId) {
        const objectFromCurrentRoom = this.getObjectFromRoom(this.currentRoom);
        if (objectFromCurrentRoom) {
            return objectFromCurrentRoom;
        }
        const object = this.roomLayer.findOne((child) =>
            this.matchNodeByCategories(child, this.roomObjectCategories) && this.matchNodeById(child, objectId)
        );
        return object;
    }

    /**
     * Move item to room layer, for example on drag start, so that it can be "hidden" from inventory.
     * @param {Konva.Image} item
     */
    moveItemToRoomLayer(item) {
        item.moveTo(this.roomLayer);
        this.uiEventEmitter.emit('item_moved_to_room_layer');
    }

    /**
     * Not sure if we can commit to hiding _previous_ room, or should this just be "hideRoom"
     * @param {string} from room id of the room we have faded out
     */
    hidePreviousRoom(from) {
        const room = this.getRoom(from);
        room.hide();
    }

    /**
     * @param {string} roomId room to make visible
     */
    showRoom(roomId) {
        const room = this.getRoom(roomId);
        room.show();
        this.currentRoom = room;
        this.drawRoomLayer();
        this.uiEventEmitter.emit('current_room_changed', room);
    }

    drawRoomLayer() {
        this.roomLayer.draw();
    }

    /**
     * Add an object to the stage. Currently, this means setting its visibility to true.
     * TODO: Add animations & related parts.
     * @param {string[]} objectNames
     */
    addObject(objectNames) {
        objectNames.forEach((objectName) => {
            const object = this.getObject(objectName);
            object.clearCache();
            object.show();
            object.cache();
        });
        this.drawRoomLayer();
    }

    /**
     * Remove an object from stage. Called after interactions that remove objects.
     * The removed object is simply hidden.
     *
     * @param {string[]} objectNames
     */
    removeObject(objectNames) {
        objectNames.forEach((objectName) => {
            const object = this.getObject(objectName);
            object.hide();
        });
        this.drawRoomLayer();
    }

    clearRoomObjectBlur() {
        this.getObjectsFromCurrentRoom().each((shape, _i) => {
            shape.shadowBlur(0);
        });
    }

    /**
     * @param {*} target
     * @returns {void}
     */
    glowRoomObject(target) {
        if (!this.getObjectsFromCurrentRoom((object) => { return object === target; })) {
            return;
        }
        target.clearCache();
        target.shadowColor('purple');
        target.shadowOffset({ x: 0, y: 0 });
        target.shadowBlur(20);
    }
}

export default RoomView;
