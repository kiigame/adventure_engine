import Konva from 'konva';

import SequenceLayerBuilder from './viewbuilder/sequence/konva/SequenceLayerBuilder.js';
import SequenceBuilder from './viewbuilder/sequence/konva/SequenceBuilder.js';
import DefaultInteractionResolver from './controller/interactions/DefaultInteractionResolver.js';
import Interactions from './controller/interactions/Interactions.js';
import CommandsHandler from './controller/interactions/CommandsHandler.js';
import CommandHandler from './controller/interactions/CommandHandler.js';
import HitRegionInitializer from './view/room/HitRegionInitializer.js';
import HitRegionFilter from './view/room/hitregion/HitRegionFilter.js';
import Intersection from './view/draggeditem/intersection/Intersection.js';
import VisibilityValidator from './view/draggeditem/intersection/VisibilityValidator.js';
import CategoryValidator from './view/draggeditem/intersection/CategoryValidator.js';
import Music from './view/music/Music.js';
import AudioFactory from './view/music/AudioFactory.js';
import Text from './model/Text.js';
import EventEmitter from './events/EventEmitter.js';
import ItemsBuilder from './viewbuilder/item/konva/ItemsBuilder.js';
import ItemBuilder from './viewbuilder/item/konva/ItemBuilder.js';
import RoomAnimationBuilder from './viewbuilder/room/konva/RoomAnimationBuilder.js';
import RoomAnimationsBuilder from './viewbuilder/room/konva/RoomAnimationsBuilder.js';
import RoomAnimations from './view/room/RoomAnimations.js';
import RoomFaderBuilder from './viewbuilder/room/konva/RoomFaderBuilder.js';
import RoomFader from './view/room/RoomFader.js';
import CharacterInRoom from './model/CharacterInRoom.js';
import StageObjectGetter from './util/konva/StageObjectGetter.js';
import CharacterFramesBuilder from './viewbuilder/character/konva/CharacterFramesBuilder.js';
import CharacterAnimationsBuilder from './viewbuilder/character/konva/CharacterAnimationsBuilder.js';
import CharacterAnimations from './view/character/CharacterAnimations.js';
import InventoryView from './view/inventory/InventoryView.js';
import RoomView from './view/room/RoomView.js';
import CharacterView from './view/character/CharacterView.js';
import Inventory from './model/Inventory.js';
import InventoryViewModel from './view/inventory/InventoryViewModel.js';
import InventoryItemsView from './view/inventory/InventoryItemsView.js';
import KonvaObjectContainerPusher from './viewbuilder/util/konva/KonvaObjectContainerPusher.js';
import StageInitializer from './viewbuilder/stage/konva/StageInitializer.js';
import StageBuilder from './viewbuilder/stage/konva/StageBuilder.js';
import ImagePreparer from './viewbuilder/util/konva/ImagePreparer.js';
import FullFaderPreparer from './viewbuilder/stage/konva/FullFaderPreparer.js';
import RoomLayerBuilder from './viewbuilder/room/konva/RoomLayerBuilder.js';
import RoomBuilder from './viewbuilder/room/konva/RoomBuilder.js';
import RoomsBuilder from './viewbuilder/room/konva/RoomsBuilder.js';
import RoomChildrenTypeBuilder from './viewbuilder/room/konva/RoomChildrenTypeBuilder.js';
import BackgroundsBuilder from './viewbuilder/room/konva/BackgroundsBuilder.js';
import FurnitureBuilder from './viewbuilder/room/konva/FurnitureBuilder.js';
import OtherChildrenBuilder from './viewbuilder/room/konva/OtherChildrenBuilder.js';
import ObjectsInRoomsBuilder from './modelbuilder/ObjectsInRoomsBuilder.js';
import ObjectsInRoomBuilder from './modelbuilder/ObjectsInRoomBuilder.js';
import ObjectsInRooms from './model/ObjectsInRooms.js';
import CharacterInRoomViewModel from './view/room/CharacterInRoomViewModel.js';
import InventoryArrowsView from './view/inventory/InventoryArrowsView.js';
import InventoryArrowsViewModel from './view/inventory/InventoryArrowsViewModel.js';
import ClickHandler from './controller/ClickHandler.js';
import DragEndHandler from './controller/DragEngHandler.js';
import DraggedItemViewModel from './view/draggeditem/DraggedItemViewModel.js';
import DragTargetFinder from './view/draggeditem/DragTargetFinder.js';
import SequenceView from './view/sequence/SequenceView.js';
import DraggedItemView from './view/draggeditem/DraggedItemView.js';
import CharacterSpeechView from './view/character/CharacterSpeechView.js';
import StageView from './view/StageView.js';
import FullFadeView from './view/FullFadeView.js';

// TODO: Move DI up
import "reflect-metadata";
import { container, TYPES } from "./inversify.config.js";

export class KiiGame {
    constructor(
        sequenceLayerBuilder = null,
        itemsBuilder = null,
        clickResolvers = [],
        dragResolvers = [],
        hitRegionInitializer = null,
        intersection = null,
        roomObjectCategories = { 'furniture': { 'roomChildrenTypeBuilder': new FurnitureBuilder() } },
        gameEventEmitter = new EventEmitter(),
        uiEventEmitter = new EventEmitter(),
        gameData = {},
    ) {
        if (itemsBuilder === null) {
            itemsBuilder = new ItemsBuilder(
                new ItemBuilder()
            );
        }

        if (clickResolvers.length == 0) {
            clickResolvers.push(
                new DefaultInteractionResolver('furniture'),
                new DefaultInteractionResolver('item')
            );
        }
        if (dragResolvers.length == 0) {
            dragResolvers.push(
                new DefaultInteractionResolver('furniture'),
                new DefaultInteractionResolver('item')
            );
        }

        if (hitRegionInitializer === null) {
            hitRegionInitializer = new HitRegionInitializer(
                new HitRegionFilter([], ['Image']),
                uiEventEmitter
            );
        }
        if (intersection === null) {
            intersection = new Intersection(
                [
                    new VisibilityValidator(),
                    new CategoryValidator()
                ]
            );
        }

        // Model start
        // "Objects in rooms" model
        // Build the initial "objects in rooms" state
        const initialObjectsInRoomsState = new ObjectsInRoomsBuilder(
            new ObjectsInRoomBuilder(Object.keys(roomObjectCategories))
        ).build(gameData.rooms_json);
        new ObjectsInRooms(initialObjectsInRoomsState, gameEventEmitter);
        // "Player character in room" model
        new CharacterInRoom(gameEventEmitter);
        // Inventory model
        this.inventory = new Inventory(gameEventEmitter, uiEventEmitter);
        // Text model(?)
        this.text = new Text(gameData.text_json);
        // Model end

        // View builder start
        // Bootstrap
        this.stage = new StageInitializer().initialize(gameData.layersJson);
        this.stageObjectGetter = new StageObjectGetter(this.stage);
        const imagePreparer = new ImagePreparer(this.stageObjectGetter);
        const konvaObjectContainerPusher = new KonvaObjectContainerPusher();
        // Build stage
        const fullFadeBuilder = new FullFaderPreparer(this.stageObjectGetter, imagePreparer);
        if (sequenceLayerBuilder === null) {
            // TODO: Move DI up
            const slideBuilder = container.get(TYPES.SlideBuilder);
            sequenceLayerBuilder = new SequenceLayerBuilder(
                new SequenceBuilder(
                    slideBuilder
                ),
                konvaObjectContainerPusher,
                gameData.sequences_json,
                this.stageObjectGetter.getObject("sequence_layer")
            );
        }
        // Read room children type builders from the config given to the constructor
        const roomObjectCategoryBuilders = [];
        for (const [key, roomObjectCategory] of Object.entries(roomObjectCategories)) {
            if (roomObjectCategory.roomChildrenTypeBuilder) {
                roomObjectCategoryBuilders.push(
                    new RoomChildrenTypeBuilder(key, roomObjectCategory.roomChildrenTypeBuilder)
                );
            }
        }
        const roomLayerBuilder = new RoomLayerBuilder(
            new RoomsBuilder(
                new RoomBuilder([
                    // Order may be important - for example, backgrounds should go in first so
                    // they don't overlap furniture
                    new RoomChildrenTypeBuilder('backgrounds', new BackgroundsBuilder()),
                    ...roomObjectCategoryBuilders, // consider using inversify for DI here
                    new RoomChildrenTypeBuilder('other', new OtherChildrenBuilder())
                ])
            ),
            konvaObjectContainerPusher,
            new RoomFaderBuilder(),
            imagePreparer,
            gameData.rooms_json,
            this.stageObjectGetter.getObject("room_layer")
        );
        const stageBuilder = new StageBuilder(
            this.stage,
            fullFadeBuilder,
            sequenceLayerBuilder,
            roomLayerBuilder,
            imagePreparer
        );
        stageBuilder.build();
        // Build items and push them to the inventory item cache layer
        const inventoryItems = this.stageObjectGetter.getObject('inventory_items');
        const items = itemsBuilder.build(gameData.items_json);
        konvaObjectContainerPusher.execute(items, inventoryItems);
        // Creating all item image objects from json
        imagePreparer.prepareImages(inventoryItems.toObject());
        // Not sure if this is necessary
        inventoryItems.getChildren((shape) => {
            if (shape.getClassName === 'Image') {
                shape.clearCache();
            }
        });
        // Build items end
        // Build inventory
        const inventoryBarLayer = this.stageObjectGetter.getObject('inventory_bar_layer');
        imagePreparer.prepareImages(inventoryBarLayer.toObject());
        // Scale inventory bar to stage
        this.stageObjectGetter.getObject("inventory_bar").y(this.stage.height() - 100);
        this.stageObjectGetter.getObject("inventory_bar").width(this.stage.width());
        // Build inventory end
        // Build character layer
        // Push character animation frames to correct layer.
        const characterLayer = this.stageObjectGetter.getObject("character_layer");
        const characterFrames = new CharacterFramesBuilder({ x: 764, y: 443 }).build(gameData.character_json.frames);
        konvaObjectContainerPusher.execute(characterFrames, characterLayer);
        // Creating all image objects from json
        imagePreparer.prepareImages(characterLayer.toObject());
        // Build character layer end
        // View builder end

        // View start
        // Stage view start
        new StageView(
            uiEventEmitter,
            this.stage
        );
        // Stage view end

        // Animation for fading the whole screen
        const fader_full = this.stageObjectGetter.getObject("fader_full");
        const fade_full = new Konva.Tween({
            node: fader_full,
            duration: 0.6,
            opacity: 1
        });
        new FullFadeView(
            uiEventEmitter,
            fader_full,
            fade_full
        );
        // Full fader view end

        // Sequences view start
        new SequenceView(
            uiEventEmitter,
            gameEventEmitter,
            this.stageObjectGetter,
            gameData.sequences_json,
            this.stageObjectGetter.getObject('sequence_layer')
        );
        // Sequences end

        // Rooms view start
        const roomLayer = this.stageObjectGetter.getObject('room_layer');
        // Room view component
        const roomView = new RoomView(
            uiEventEmitter,
            gameEventEmitter,
            hitRegionInitializer,
            roomLayer,
            Object.keys(roomObjectCategories),
        );
        // Build room object animations and set up RoomAnimations view component
        const animatedRoomObjects = new RoomAnimationsBuilder(
            new RoomAnimationBuilder(),
            this.stageObjectGetter
        ).build(roomView.getRooms());
        new RoomAnimations(gameEventEmitter, uiEventEmitter, animatedRoomObjects);
        // Animation for fading the room portion of the screen
        const roomFaderNode = this.stageObjectGetter.getObject("fader_room");
        new RoomFader(
            roomFaderNode,
            uiEventEmitter
        );
        // Character in room view model
        new CharacterInRoomViewModel(uiEventEmitter, gameEventEmitter);
        // Rooms view end

        // Inventory & items view start
        // Inventory items view component
        const inventoryItemsView = new InventoryItemsView(
            uiEventEmitter,
            gameEventEmitter,
            inventoryItems,
            this.stage.height() - 90
        );
        // Inventory arrows view component
        const inventoryArrowsView = new InventoryArrowsView(
            uiEventEmitter,
            inventoryBarLayer.find('#inventory_arrows')[0]
        );
        // Inventory view component
        const inventoryView = new InventoryView(
            uiEventEmitter,
            this.stageObjectGetter,
            inventoryBarLayer,
            inventoryItemsView,
            inventoryArrowsView
        );
        new InventoryViewModel(
            uiEventEmitter,
            gameEventEmitter,
            7 // inventoryMax, TODO make configurable/responsive
        )
        // Inventory arrows view model
        new InventoryArrowsViewModel(
            uiEventEmitter
        );
        // Dragged item view
        new DraggedItemView(
            uiEventEmitter,
            this.stageObjectGetter.getObject("interaction_text"),
            this.text
        );
        // Dragged item view model
        new DraggedItemViewModel(
            uiEventEmitter,
            new DragTargetFinder(
                intersection,
                roomView,
                inventoryItemsView,
                inventoryArrowsView
            )
        );
        // Inventory & items view end

        // Character view start
        // Load up frames from json and set up CharacterAnimations view component
        const characterAnimationData = gameData.character_json.animations;
        const characterAnimations = new CharacterAnimationsBuilder(
            this.stageObjectGetter
        ).build(characterAnimationData);
        new CharacterAnimations(
            characterAnimations,
            uiEventEmitter,
            gameEventEmitter
        );
        // Character view component
        new CharacterView(
            characterLayer,
            uiEventEmitter
        );
        new CharacterSpeechView(
            uiEventEmitter,
            gameEventEmitter,
            this.stageObjectGetter.getObject("monologue"),
            this.stageObjectGetter.getObject("character_speech_bubble"),
            this.stage.height()
        );
        // Character view end

        // Text view start (to refactor)
        this.npc_monologue = this.stageObjectGetter.getObject("npc_monologue");
        this.npc_speech_bubble = this.stageObjectGetter.getObject("npc_speech_bubble");
        this.text_layer = this.stageObjectGetter.getObject("text_layer");
        gameEventEmitter.on('monologue', (_text) => {
            this.clearNpcMonologue();
        });
        gameEventEmitter.on('npc_monologue', ({ npc, text }) => {
            this.clearNpcMonologue();
            this.npcMonologue(npc, text);
        });
        uiEventEmitter.on('clicked_on_stage', () => {
            this.clearNpcMonologue();
        });
        uiEventEmitter.on('inventory_item_drag_start', (_target) => {
            this.clearNpcMonologue();
        });
        // TODO: refactor interaction texts from text_layer to something that DraggedItemView manages
        uiEventEmitter.on('interaction_text_cleared', () => {
            this.text_layer.draw();
        });
        uiEventEmitter.on('text_on_drag_move_updated', () => {
            this.text_layer.draw();
        });
        // Text view end

        // Music view
        new Music(gameData.music_json, new AudioFactory(), uiEventEmitter, gameEventEmitter);
        // Music view end
        // View end

        // Controller start
        this.interactions = new Interactions(gameData.interactions_json);
        const commandHandler = new CommandHandler(
            gameEventEmitter,
            uiEventEmitter,
            this.stageObjectGetter,
            this.text,
            gameData.items_json, // TODO: items model?
        );
        const commandsHandler = new CommandsHandler(
            commandHandler
        )
        new ClickHandler(
            uiEventEmitter,
            commandsHandler,
            clickResolvers,
            this.interactions
        );
        new DragEndHandler(
            uiEventEmitter,
            commandsHandler,
            dragResolvers,
            this.interactions
        );
        // Controller end

        // Preparation done, final steps:
        this.stage.draw();
        commandsHandler.handleCommands(
            new DefaultInteractionResolver('start').resolveCommands(
                this.interactions,
                gameData.startInteraction,
                'start'
            )
        );
    }

    /**
     * TODO: move to room view
     * Set NPC monologue text and position the NPC speech bubble to the
     * desired NPC.
     * @param {Konva.Shape} npc  The object in the stage that will
     *                 have the speech bubble.
     * @param {string} text The text to be shown in the speech bubble.
     */
    npcMonologue(npc, text) {
        this.npc_monologue.setWidth('auto');
        this.npc_speech_bubble.show();
        this.npc_monologue.text(text);

        const npc_tag = this.stageObjectGetter.getObject("npc_tag");
        if (npc.x() + npc.width() > (this.stage.width() / 2)) {
            npc_tag.pointerDirection("right");
            if (this.npc_monologue.width() > npc.x() - 100) {
                this.npc_monologue.width(npc.x() - 100);
            }
            this.npc_speech_bubble.x(npc.x());
        } else {
            npc_tag.pointerDirection("left");
            if (this.npc_monologue.width() > this.stage.width() - (npc.x() + npc.width() + 100)) {
                this.npc_monologue.width(this.stage.width() - (npc.x() + npc.width() + 100));
            }
            this.npc_speech_bubble.x(npc.x() + npc.width());
        }

        this.npc_speech_bubble.y(npc.y() + (npc.height() / 3));

        this.text_layer.draw();
    }

    /**
     * TODO: move to room view
     */
    clearNpcMonologue() {
        this.npc_monologue.text("");
        this.npc_speech_bubble.hide();
        this.text_layer.draw();
    }
}
