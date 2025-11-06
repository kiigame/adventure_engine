import Konva from 'konva';

import SequenceLayerBuilder from './viewbuilder/sequence/konva/SequenceLayerBuilder.js';
import DefaultInteractionResolver from './controller/interactions/DefaultInteractionResolver.js';
import Interactions from './controller/interactions/Interactions.js';
import CommandsHandler from './controller/interactions/CommandsHandler.js';
import { CommandHandler } from './controller/interactions/CommandHandler.js';
import HitRegionInitializer from './view/room/HitRegionInitializer.js';
import HitRegionFilter from './view/room/hitregion/HitRegionFilter.js';
import Intersection from './view/draggeditem/intersection/Intersection.js';
import VisibilityValidator from './view/draggeditem/intersection/VisibilityValidator.js';
import CategoryValidator from './view/draggeditem/intersection/CategoryValidator.js';
import Music from './view/music/Music.js';
import AudioFactory from './view/music/AudioFactory.js';
import { Text } from './model/Text.js';
import RoomAnimationBuilder from './viewbuilder/room/konva/RoomAnimationBuilder.js';
import RoomAnimationsBuilder from './viewbuilder/room/konva/RoomAnimationsBuilder.js';
import RoomAnimations from './view/room/RoomAnimations.js';
import RoomFaderBuilder from './viewbuilder/room/konva/RoomFaderBuilder.js';
import RoomFader from './view/room/RoomFader.js';
import CharacterInRoom from './model/CharacterInRoom.js';
import { StageObjectGetter } from './util/konva/StageObjectGetter.js';
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
import { FurnitureBuilder } from './viewbuilder/room/konva/FurnitureBuilder.js';
import { OtherChildrenBuilder } from './viewbuilder/room/konva/OtherChildrenBuilder.js';
import ObjectsInRoomsBuilder from './modelbuilder/ObjectsInRoomsBuilder.js';
import ObjectsInRoomBuilder from './modelbuilder/ObjectsInRoomBuilder.js';
import ObjectsInRooms from './model/ObjectsInRooms.js';
import CharacterInRoomViewModel from './view/room/CharacterInRoomViewModel.js';
import InventoryArrowsView from './view/inventory/InventoryArrowsView.js';
import InventoryArrowsViewModel from './view/inventory/InventoryArrowsViewModel.js';
import { ClickHandler } from './controller/ClickHandler.js';
import DragEndHandler from './controller/DragEngHandler.js';
import DraggedItemViewModel from './view/draggeditem/DraggedItemViewModel.js';
import DragTargetFinder from './view/draggeditem/DragTargetFinder.js';
import SequenceView from './view/sequence/SequenceView.js';
import DraggedItemView from './view/draggeditem/DraggedItemView.js';
import CharacterSpeechView from './view/character/CharacterSpeechView.js';
import StageView from './view/StageView.js';
import FullFadeView from './view/FullFadeView.js';
import NpcMonologueView from './view/room/NpcMonologueView.js';
import { RoomChildrenBuilder } from './viewbuilder/room/konva/RoomChildrenBuilder.js';

import "reflect-metadata";
import { container, GameEventEmitter, UiEventEmitter } from "./inversify.config.js";
import ItemsBuilder from 'viewbuilder/item/konva/ItemsBuilder.js';
import SequenceBuilder from 'viewbuilder/sequence/konva/SequenceBuilder.js';

type RoomObjectCategoryType = {
    roomChildrenTypeBuilder: RoomChildrenBuilder
};

export type RoomObjectCategoriesType = Record<string, RoomObjectCategoryType>;

export class KiiGame {
    private inventory: Inventory;
    private text: Text;
    private stage: Konva.Stage;
    private stageObjectGetter: StageObjectGetter;
    private interactions: Interactions;

    constructor(
        clickResolvers: DefaultInteractionResolver[] = [],
        dragResolvers: DefaultInteractionResolver[] = [],
        hitRegionInitializer: HitRegionInitializer = new HitRegionInitializer(
            new HitRegionFilter([], ['Image']),
            container.get(UiEventEmitter)
        ),
        intersection: Intersection = new Intersection(
            [
                new VisibilityValidator(),
                new CategoryValidator()
            ]
        ),
        roomObjectCategories: RoomObjectCategoriesType = { furniture: { roomChildrenTypeBuilder: new FurnitureBuilder() } },
        gameEventEmitter = container.get(GameEventEmitter),
        uiEventEmitter = container.get(UiEventEmitter),
        gameData: any = {},
    ) {
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

        // Model start
        // "Objects in rooms" model
        // Build the initial "objects in rooms" state
        const initialObjectsInRoomsState = new ObjectsInRoomsBuilder(
            new ObjectsInRoomBuilder(Object.keys(roomObjectCategories))
        ).build(gameData.rooms_json);
        new ObjectsInRooms(initialObjectsInRoomsState, container.get(GameEventEmitter));
        // "Player character in room" model
        new CharacterInRoom(container.get(GameEventEmitter));
        // Inventory model
        this.inventory = new Inventory(container.get(GameEventEmitter), container.get(UiEventEmitter));
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
        const fullFadeBuilder = new FullFaderPreparer(this.stageObjectGetter.getObject('full_screen_layer'), imagePreparer);
        const sequenceLayerBuilder = new SequenceLayerBuilder(
            container.get(SequenceBuilder),
            konvaObjectContainerPusher,
            gameData.sequences_json,
            this.stageObjectGetter.getObject("sequence_layer")
        );
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
        const itemsBuilder: ItemsBuilder = container.get(ItemsBuilder);
        const items = itemsBuilder.build(gameData.items_json);
        const inventoryItems = this.stageObjectGetter.getObject('inventory_items');
        konvaObjectContainerPusher.execute(items, inventoryItems);
        // Creating all item image objects from json
        imagePreparer.prepareImages(inventoryItems.toObject());
        // Build items end
        // Build inventory
        const inventoryBarLayer = this.stageObjectGetter.getObject('inventory_bar_layer') as Konva.Layer;
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
            container.get(UiEventEmitter),
            this.stage
        );
        // Stage view end

        // Animation for fading the whole screen
        const fadeFull = new Konva.Tween({
            node: this.stageObjectGetter.getObject('black_screen_full'),
            duration: 0.6,
            opacity: 1
        });
        new FullFadeView(
            container.get(UiEventEmitter),
            fadeFull
        );
        // Full fader view end

        // Sequences view start
        new SequenceView(
            container.get(UiEventEmitter),
            container.get(GameEventEmitter),
            this.stageObjectGetter,
            gameData.sequences_json,
            this.stageObjectGetter.getObject('sequence_layer') as Konva.Layer
        );
        // Sequences end

        // Rooms view start
        const roomLayer = this.stageObjectGetter.getObject('room_layer') as Konva.Layer;
        // Room view component
        const roomView = new RoomView(
            container.get(UiEventEmitter),
            container.get(GameEventEmitter),
            hitRegionInitializer,
            roomLayer,
            Object.keys(roomObjectCategories),
        );
        // Build room object animations and set up RoomAnimations view component
        const animatedRoomObjects = new RoomAnimationsBuilder(
            new RoomAnimationBuilder(),
            this.stageObjectGetter
        ).build(roomView.getRooms());
        new RoomAnimations(
            container.get(GameEventEmitter),
            container.get(UiEventEmitter),
            animatedRoomObjects
        );
        // NPC Monologue View
        new NpcMonologueView(
            container.get(UiEventEmitter),
            container.get(GameEventEmitter),
            this.stageObjectGetter.getObject("npc_speech_bubble"),
            this.stage.width()
        );
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
            container.get(UiEventEmitter),
            container.get(GameEventEmitter),
            inventoryItems,
            this.stage.height() - 90
        );
        // Inventory arrows view component
        const inventoryArrowsView = new InventoryArrowsView(
            container.get(UiEventEmitter),
            inventoryBarLayer.find('#inventory_arrows')[0]
        );
        // Inventory view component
        const inventoryView = new InventoryView(
            container.get(UiEventEmitter),
            this.stageObjectGetter,
            inventoryBarLayer,
            inventoryItemsView,
            inventoryArrowsView
        );
        new InventoryViewModel(
            container.get(UiEventEmitter),
            container.get(GameEventEmitter),
            7 // inventoryMax, TODO make configurable/responsive
        )
        // Inventory arrows view model
        new InventoryArrowsViewModel(
            container.get(UiEventEmitter),
        );
        // Dragged item view
        new DraggedItemView(
            container.get(UiEventEmitter),
            this.stageObjectGetter.getObject('full_screen_layer'),
            this.stageObjectGetter.getObject("interaction_text")
        );
        // Dragged item view model
        new DraggedItemViewModel(
            container.get(UiEventEmitter),
            new DragTargetFinder(
                intersection,
                roomView,
                inventoryItemsView,
                inventoryArrowsView
            ),
            this.text
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
            container.get(UiEventEmitter),
            container.get(GameEventEmitter)
        );
        // Character view component
        new CharacterView(
            characterLayer,
            container.get(UiEventEmitter)
        );
        new CharacterSpeechView(
            container.get(UiEventEmitter),
            container.get(GameEventEmitter),
            this.stageObjectGetter.getObject("monologue"),
            this.stageObjectGetter.getObject("character_speech_bubble"),
            this.stage.height()
        );
        // Character view end

        // Music view
        new Music(gameData.music_json, new AudioFactory(), container.get(UiEventEmitter));
        // Music view end
        // View end

        // Controller start
        this.interactions = new Interactions(gameData.interactions_json);
        const commandHandler = new CommandHandler(
            container.get(GameEventEmitter),
            container.get(UiEventEmitter),
            this.stageObjectGetter,
            this.text,
            gameData.items_json, // TODO: items model?
        );
        const commandsHandler = new CommandsHandler(
            commandHandler
        )
        new ClickHandler(
            container.get(UiEventEmitter),
            commandsHandler,
            clickResolvers,
            this.interactions
        );
        new DragEndHandler(
            container.get(UiEventEmitter),
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

    getStage(): Konva.Stage {
        return this.stage;
    }

    getInventory(): Inventory {
        return this.inventory;
    }

    getStageObjectGetter(): StageObjectGetter {
        return this.stageObjectGetter;
    }

    getText(): Text {
        return this.text;
    }

    getInteractions(): Interactions {
        return this.interactions;
    }
}
