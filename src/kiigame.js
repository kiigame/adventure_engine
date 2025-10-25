import Konva from 'konva';

import SequenceLayerBuilder from './viewbuilder/sequence/konva/SequenceLayerBuilder.js';
import SequenceBuilder from './viewbuilder/sequence/konva/SequenceBuilder.js';
import DefaultInteractionResolver from './controller/interactions/DefaultInteractionResolver.js';
import Interactions from './controller/interactions/Interactions.js';
import CommandsHandler from './controller/interactions/CommandsHandler.js';
import CommandHandler from './controller/interactions/CommandHandler.js';
import HitRegionInitializer from './view/stage/HitRegionInitializer.js';
import HitRegionFilter from './view/stage/hitregion/HitRegionFilter.js';
import Intersection from './view/draggeditem/intersection/Intersection.js';
import VisibilityValidator from './view/draggeditem/intersection/VisibilityValidator.js';
import CategoryValidator from './view/draggeditem/intersection/CategoryValidator.js';
import Music from './view/music/Music.js';
import AudioFactory from './view/music/AudioFactory.js';
import Text from './controller/Text.js';
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
        this.uiEventEmitter = uiEventEmitter;

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
                this.uiEventEmitter
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
        this.inventory = new Inventory(gameEventEmitter, this.uiEventEmitter);
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
        this.fader_full = this.stageObjectGetter.getObject("fader_full");
        // Animation for fading the whole screen
        this.fade_full = new Konva.Tween({
            node: this.fader_full,
            duration: 0.6,
            opacity: 1
        });
        this.stage.on('touchstart mousedown', () => {
            this.uiEventEmitter.emit('clicked_on_stage');
        });
        this.uiEventEmitter.on('play_full_fade_out', () => {
            this.playFullFadeOut();
        });
        this.uiEventEmitter.on('play_sequence_started', (_id) => {
            this.playFullFadeOut();
        });
        this.uiEventEmitter.on('sequence_hid_previous_slide', () => {
            this.playFullFadeOut();
        });
        this.uiEventEmitter.on('play_full_fade_in', () => {
            // Assumes fade_full has first faded out
            this.fade_full.reverse();
            setTimeout(() => {
                this.fader_full.hide();
            }, this.fade_full.tween.duration);
        });
        this.uiEventEmitter.on('sequence_last_slide_fade_out', (finalFadeDuration) => {
            this.fade_full.tween.duration = finalFadeDuration;
            this.fade_full.play();

            setTimeout(() => {
                this.uiEventEmitter.emit('play_full_fade_in');
                setTimeout(() => {
                    this.fade_full.tween.duration = 600; // reset to default
                }, finalFadeDuration);
            }, finalFadeDuration);
        });
        this.uiEventEmitter.on('sequence_last_slide_immediate', () => {
            this.fader_full.hide();
        });
        this.uiEventEmitter.on('sequence_show_next_slide_fade', () => {
            setTimeout(() => {
                this.uiEventEmitter.emit('play_full_fade_in');
                this.stage.draw();
            }, this.fade_full.tween.duration);
        });
        this.uiEventEmitter.on('sequence_show_next_slide_immediate', () => {
            this.fade_full.reset();
            this.stage.draw();
        });
        this.uiEventEmitter.on('room_hit_regions_initialized', () => {
            this.stage.draw();
        });
        this.uiEventEmitter.on('current_room_changed', (_room) => {
            this.stage.draw();
        });
        // Stage view end

        // Sequences view start
        this.sequences_json = gameData.sequences_json;
        this.sequenceLayer = this.stageObjectGetter.getObject('sequence_layer');
        this.uiEventEmitter.on('arrived_in_room', (_roomId) => {
            this.sequenceLayer.hide();
        });
        gameEventEmitter.on('play_sequence', (sequence_id) => {
            this.play_sequence(sequence_id);
        });
        this.uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.sequenceLayer.show();
        });
        // Sequences end

        // Rooms view start
        const roomLayer = this.stageObjectGetter.getObject('room_layer');
        // Room view component
        const roomView = new RoomView(
            this.uiEventEmitter,
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
        new RoomAnimations(gameEventEmitter, this.uiEventEmitter, animatedRoomObjects);
        // Animation for fading the room portion of the screen
        const roomFaderNode = this.stageObjectGetter.getObject("fader_room");
        new RoomFader(
            roomFaderNode,
            this.uiEventEmitter
        );
        // Character in room view model
        new CharacterInRoomViewModel(this.uiEventEmitter, gameEventEmitter);
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
            this.uiEventEmitter,
            this.stageObjectGetter,
            inventoryBarLayer,
            inventoryItemsView,
            inventoryArrowsView
        );
        new InventoryViewModel(
            this.uiEventEmitter,
            gameEventEmitter,
            7 // inventoryMax, TODO make configurable/responsive
        )
        // Inventory arrows view model
        new InventoryArrowsViewModel(
            this.uiEventEmitter
        );
        // Dragged item view model
        new DraggedItemViewModel(
            this.uiEventEmitter,
            intersection,
            roomView,
            inventoryView
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
            this.uiEventEmitter,
            gameEventEmitter
        );
        // Character view component
        new CharacterView(
            characterLayer,
            this.uiEventEmitter
        );
        // Character view end

        // Text view start (not sure what to do with these yet)
        this.monologue = this.stageObjectGetter.getObject("monologue");
        this.character_speech_bubble = this.stageObjectGetter.getObject("character_speech_bubble");
        this.npc_monologue = this.stageObjectGetter.getObject("npc_monologue");
        this.npc_speech_bubble = this.stageObjectGetter.getObject("npc_speech_bubble");
        this.interaction_text = this.stageObjectGetter.getObject("interaction_text");
        this.text_layer = this.stageObjectGetter.getObject("text_layer");
        gameEventEmitter.on('monologue', (text) => {
            this.clearMonologues();
            this.setMonologue(text);
        });
        gameEventEmitter.on('npc_monologue', ({ npc, text }) => {
            this.clearMonologues();
            this.npcMonologue(npc, text);
        });
        this.uiEventEmitter.on('clicked_on_stage', () => {
            this.clearMonologues();
        });
        this.uiEventEmitter.on('inventory_item_drag_start', (_target) => {
            this.clearMonologues();
        });
        this.uiEventEmitter.on('dragmove_hover_on_object', ({ target, draggedItem }) => {
            this.showTextOnDragMove(target, draggedItem);
        });
        this.uiEventEmitter.on('dragmove_hover_on_nothing', () => {
            this.clearInteractionText();
        });
        this.uiEventEmitter.on('inventory_left_arrow_draghovered', () => {
            this.clearInteractionText();
        });
        this.uiEventEmitter.on('inventory_right_arrow_draghovered', () => {
            this.clearInteractionText();
        });
        this.uiEventEmitter.on('inventory_item_drag_end_handled', (_draggedItem) => {
            this.clearInteractionText();
        });
        // Text view end

        // Music view
        new Music(gameData.music_json, new AudioFactory(), this.uiEventEmitter, gameEventEmitter);
        // Music view end
        // View end

        // Controller start
        this.text = new Text(gameData.text_json);
        this.interactions = new Interactions(gameData.interactions_json);
        const commandHandler = new CommandHandler(
            gameEventEmitter,
            this.uiEventEmitter,
            this.stageObjectGetter,
            this.text,
            gameData.items_json, // TODO: items model?
        );
        const commandsHandler = new CommandsHandler(
            commandHandler
        )
        new ClickHandler(
            this.uiEventEmitter,
            commandsHandler,
            clickResolvers,
            this.interactions
        );
        new DragEndHandler(
            this.uiEventEmitter,
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
     * TODO: move to text view component (or something)
     */
    clearInteractionText() {
        this.clearText(this.interaction_text);
    }

    /**
     * TODO: clean up and move to a view component (but which?)
     * @param {Konva.Shape} target
     * @param {Konva.Shape} draggedItem
     */
    showTextOnDragMove(target, draggedItem) {
        this.interaction_text.text(this.text.getName(target.id()));
        this.interaction_text.x(draggedItem.x() + (draggedItem.width() / 2));
        this.interaction_text.y(draggedItem.y() - 30);
        this.interaction_text.offset({
            x: this.interaction_text.width() / 2
        });

        this.text_layer.draw();
    }

    /**
     * TODO: move to full fade view component
     */
    playFullFadeOut() {
        this.fade_full.reset();
        this.fader_full.show();
        this.fade_full.play();
    }

    /** 
     * Playes a sequence definied in sequences.json by id. Currently doesn't take the
     * responsibiilty of hiding the sequence layer after playing.
     * @param {string} id The Sequence id in sequences.json
     */
    play_sequence(id) {
        let delay = 700;

        this.uiEventEmitter.emit('play_sequence_started', id);

        const currentSequence = this.stageObjectGetter.getObject(id);
        const sequenceData = this.sequences_json[id];
        const final_fade_duration = sequenceData.transition_length != null ? sequenceData.transition_length : 0;
        let currentSlide = null;

        setTimeout(() => {
            this.uiEventEmitter.emit('first_sequence_slide_shown');
            currentSequence.show();
        }, delay);

        for (let i in sequenceData.slides) {
            let previousSlide = currentSlide;
            currentSlide = this.stageObjectGetter.getObject(sequenceData.slides[i].id);

            const displaySlide = (i, currentSlide, previousSlide) => {
                setTimeout(() => {
                    if (previousSlide) {
                        previousSlide.hide();
                        this.uiEventEmitter.emit('sequence_hid_previous_slide');
                    }

                    // Show current slide (note stage.draw only below)
                    currentSlide.show();

                    // Fade in?
                    const slideFade = sequenceData.slides[i].do_fade;
                    if (slideFade === true) {
                        this.uiEventEmitter.emit('sequence_show_next_slide_fade');
                    } else {
                        this.uiEventEmitter.emit('sequence_show_next_slide_immediate');
                    }
                }, delay);
            }
            displaySlide(i, currentSlide, previousSlide);

            delay = delay + sequenceData.slides[i].show_time;
        };

        // After last slide, do the final fade
        if (final_fade_duration > 0) {
            setTimeout(() => {
                this.uiEventEmitter.emit('sequence_last_slide_fade_out', final_fade_duration);
            }, delay);

            // Doesn't include the fade-in!
            delay = delay + final_fade_duration;
        } else {
            setTimeout(() => {
                this.uiEventEmitter.emit('sequence_last_slide_immediate');
            }, delay);
        }
    }

    // Clearing the given text
    clearText(text) {
        text.text("");

        if (text.id() == 'monologue') {
            this.character_speech_bubble.hide();
        } else if (text.id() == 'npc_monologue') {
            this.npc_speech_bubble.hide();
        }

        this.text_layer.draw();
    }

    /**
     * Set NPC monologue text and position the NPC speech bubble to the
     * desired NPC.
     * @param {*} npc  The object in the stage that will
     *                 have the speech bubble.
     * @param {*} text The text to be shown in the speech bubble.
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

    /// Set monologue text.
    /// @param text The text to be shown in the monologue bubble.
    setMonologue(text) {
        this.monologue.setWidth('auto');
        this.character_speech_bubble.show();
        this.monologue.text(text);
        if (this.monologue.width() > 524) {
            this.monologue.width(524);
            this.monologue.text(text);
        }

        this.character_speech_bubble.y(this.stage.height() - 100 - 15 - this.monologue.height() / 2);
        this.text_layer.draw();
        this.uiEventEmitter.emit(
            'play_character_speak_animation',
            { duration: 3000 }
        );
    }

    /**
     * TODO: move to (a) view component(s)
     */
    clearMonologues() {
        this.clearText(this.monologue);
        this.clearText(this.npc_monologue);
    }
}
