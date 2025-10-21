import Konva from 'konva';

import SequenceLayerBuilder from './viewbuilder/sequence/konva/SequenceLayerBuilder.js';
import SequenceBuilder from './viewbuilder/sequence/konva/SequenceBuilder.js';
import DefaultInteractionResolver from './controller/interactions/DefaultInteractionResolver.js';
import Interactions from './controller/interactions/Interactions.js';
import CommandsHandler from './controller/interactions/CommandsHandler.js';
import CommandHandler from './controller/interactions/CommandHandler.js';
import HitRegionInitializer from './view/stage/HitRegionInitializer.js';
import HitRegionFilter from './view/stage/hitregion/HitRegionFilter.js';
import Intersection from './view/Intersection.js';
import VisibilityValidator from './view/intersection/VisibilityValidator.js';
import CategoryValidator from './view/intersection/CategoryValidator.js';
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
import KonvaObjectLayerPusher from './viewbuilder/util/konva/KonvaObjectLayerPusher.js';
import StageInitializer from './viewbuilder/stage/konva/StageInitializer.js';
import StageBuilder from './viewbuilder/stage/konva/StageBuilder.js';
import ImagePreparer from './viewbuilder/stage/konva/ImagePreparer.js';
import FullFaderPreparer from './viewbuilder/stage/konva/FullFaderPreparer.js';

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
        roomObjectCategories = ['furniture'],
        gameEventEmitter = new EventEmitter(),
        uiEventEmitter = new EventEmitter(),
        gameData = {},
    ) {
        this.clickResolvers = clickResolvers;
        this.dragResolvers = dragResolvers;
        this.intersection = intersection;
        this.gameEventEmitter = gameEventEmitter;
        this.uiEventEmitter = uiEventEmitter;

        if (itemsBuilder === null) {
            itemsBuilder = new ItemsBuilder(
                new ItemBuilder()
            );
        }

        if (this.clickResolvers.length == 0) {
            this.clickResolvers.push(
                new DefaultInteractionResolver('furniture'),
                new DefaultInteractionResolver('item')
            );
        }
        if (this.dragResolvers.length == 0) {
            this.dragResolvers.push(
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
        if (this.intersection === null) {
            this.intersection = new Intersection(
                [
                    new VisibilityValidator(),
                    new CategoryValidator()
                ]
            );
        }

        // Model start
        // "Player character in room" model status
        new CharacterInRoom(this.uiEventEmitter, this.gameEventEmitter);
        // Inventory model
        this.inventory = new Inventory(this.gameEventEmitter, this.uiEventEmitter);
        // Model end

        // View builder start
        // Bootstrap
        this.stage = new StageInitializer().initialize(gameData.layersJson);
        this.stageObjectGetter = new StageObjectGetter(this.stage);
        const imagePreparer = new ImagePreparer(this.stageObjectGetter);
        const konvaObjectLayerPusher = new KonvaObjectLayerPusher();
        // Build stage
        if (sequenceLayerBuilder === null) {
            // TODO: Move DI up
            const slideBuilder = container.get(TYPES.SlideBuilder);
            sequenceLayerBuilder = new SequenceLayerBuilder(
                new SequenceBuilder(
                    slideBuilder
                ),
                konvaObjectLayerPusher,
                gameData.sequences_json,
                this.stageObjectGetter.getObject("sequence_layer")
            );
        }
        const fullFadeBuilder = new FullFaderPreparer(this.stageObjectGetter, imagePreparer);
        const stageBuilder = new StageBuilder(
            this.stage,
            fullFadeBuilder,
            sequenceLayerBuilder,
            imagePreparer
        );
        stageBuilder.build();
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
        this.gameEventEmitter.on('arrived_in_room', (roomId) => {
            this.sequenceLayer.hide();
        });
        this.gameEventEmitter.on('play_sequence', (sequence_id) => {
            this.play_sequence(sequence_id);
        });
        this.uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.sequenceLayer.show();
        });
        // Sequences end

        // Rooms view start
        // Build rooms
        const roomLayer = this.stageObjectGetter.getObject("room_layer");
        konvaObjectLayerPusher.execute(gameData.rooms_json, roomLayer);
        konvaObjectLayerPusher.execute([new RoomFaderBuilder().buildRoomFader()], roomLayer);
        // Prepare room object images
        for (const child of roomLayer.toObject().children) {
            imagePreparer.prepareImages(child);
        }
        // Room view component
        this.roomView = new RoomView(
            this.uiEventEmitter,
            this.gameEventEmitter,
            hitRegionInitializer,
            roomLayer,
            roomObjectCategories,
        );
        // Build room object animations and set up RoomAnimations view component
        const animatedRoomObjects = new RoomAnimationsBuilder(
            new RoomAnimationBuilder(),
            this.stageObjectGetter
        ).build(this.roomView.getRooms());
        new RoomAnimations(this.gameEventEmitter, animatedRoomObjects);
        // Scale room fader UI
        this.stageObjectGetter.getObject("black_screen_room").size({ width: this.stage.width(), height: this.stage.height() - 100 });
        // Animation for fading the room portion of the screen
        const roomFaderNode = this.stageObjectGetter.getObject("fader_room");
        new RoomFader(
            roomFaderNode,
            this.uiEventEmitter,
            this.gameEventEmitter
        );
        // Rooms view end

        // Inventory & items view start
        // Build items and push them to the inventory item cache layer
        const inventoryItemCache = this.stageObjectGetter.getObject('inventory_item_cache');
        const items = itemsBuilder.build(gameData.items_json);
        konvaObjectLayerPusher.execute(items, inventoryItemCache);
        // Creating all item image objects from json
        imagePreparer.prepareImages(inventoryItemCache.toObject());
        // Set the drag start listener -> ui event emitting for the prospective inventory items
        inventoryItemCache.find('Image').on('dragstart', (event) => {
            this.uiEventEmitter.emit('inventory_drag_start', event.target);
        });
        const inventoryBarLayer = this.stageObjectGetter.getObject('inventory_bar_layer');
        imagePreparer.prepareImages(inventoryBarLayer.toObject());
        // Scale inventory bar to stage
        this.stageObjectGetter.getObject("inventory_bar").y(this.stage.height() - 100);
        this.stageObjectGetter.getObject("inventory_bar").width(this.stage.width());
        // Inventory items view component
        const inventoryItemsView = new InventoryItemsView(
            uiEventEmitter,
            gameEventEmitter,
            this.stageObjectGetter,
            inventoryBarLayer.findOne((node) => node.attrs.id === 'inventory_items'),
            this.stage.height() - 90
        );
        // Inventory view component
        this.inventoryView = new InventoryView(
            this.uiEventEmitter,
            this.gameEventEmitter,
            this.stageObjectGetter,
            inventoryBarLayer,
            inventoryItemsView
        );
        new InventoryViewModel(
            this.uiEventEmitter,
            this.gameEventEmitter,
            7 // inventoryMax, TODO make configurable/responsive
        )
        // Item Drag View Model
        // Temporary location for inventory items if they need to be moved back to the location because of invalid interaction
        this.dragStartX;
        this.dragStartY;
        // For limiting the amount of intersection checks
        this.delayEnabled = false;
        // For limiting the speed of inventory browsing when dragging an item
        this.dragDelay = 500;
        this.dragDelayEnabled = false;
        // The item dragged from the inventory
        this.dragged_item;
        // Intersection target (object below dragged item)
        this.target;
        this.uiEventEmitter.on('inventory_drag_start', (target) => {
            this.dragged_item = target;
        });
        this.uiEventEmitter.on('inventory_touchstart', (target) => {
            this.dragStartX = target.x();
            this.dragStartY = target.y();
        });
        // While dragging events (use item on item or object)
        this.stage.on('dragmove', (event) => {
            this.dragged_item = event.target;

            if (!this.delayEnabled) {
                // Setting a small delay to not spam intersection check on every moved pixel
                this.setDelay(10);

                const currentRoomObjects = this.roomView.getObjectsFromCurrentRoom();
                // Loop through all the items on the current object layer
                for (let i = 0; i < currentRoomObjects.length; i++) {
                    const object = currentRoomObjects[i];

                    if (object != undefined && object.getAttr('category') != 'room_background') {
                        // Break if still intersecting with the same target
                        if (this.target != null && this.intersection.check(this.dragged_item, this.target)) {
                            break;
                        } else if (this.intersection.check(this.dragged_item, object)) {
                            // If not, check for a new target
                            if (this.target != object) {
                                this.target = object;
                            }
                            break;
                        } else {
                            // No target, move on
                            this.target = null;
                        }
                    }
                }

                // If no intersecting targets were found on object layer, check the inventory
                if (this.target == null) {
                    const visibleInventoryItems = this.inventoryView.inventoryItemsView.getVisibleInventoryItems();
                    // Loop through all the items on the inventory layer
                    for (let i = 0; i < visibleInventoryItems.length; i++) {
                        const object = visibleInventoryItems[i];
                        if (object != undefined) {
                            // Look for intersecting targets
                            if (this.intersection.check(this.dragged_item, object)) {
                                if (this.target != object) {
                                    this.target = object;
                                }
                                break;
                            } else {
                                this.target = null;
                            }
                        }
                    }
                }

                // Next, check if the item is dragged over the inventory arrows
                if (this.target == null) {
                    const leftArrow = this.stageObjectGetter.getObject("inventory_left_arrow");
                    const rightArrow = this.stageObjectGetter.getObject("inventory_right_arrow");
                    if (!this.dragDelayEnabled) {
                        if (this.intersection.check(this.dragged_item, leftArrow)) {
                            this.dragDelayEnabled = true;
                            this.uiEventEmitter.emit('inventory_left_arrow_draghovered');
                            setTimeout(() => this.dragDelayEnabled = false, this.dragDelay);
                        } else if (this.intersection.check(this.dragged_item, rightArrow)) {
                            this.dragDelayEnabled = true;
                            this.uiEventEmitter.emit('inventory_right_arrow_draghovered');
                            setTimeout(() => this.dragDelayEnabled = false, this.dragDelay);
                        } else {
                            this.target = null;
                        }
                    }
                    this.clearInteractionText();
                }

                // If target is found, highlight it and show the interaction text
                if (this.target != null) {
                    this.uiEventEmitter.emit('dragmove_hover_on_object', this.target);
                } else {
                    this.uiEventEmitter.emit('dragmove_hover_on_nothing');
                }
            }
        });
        // Drag end events for inventory items.
        this.stage.find('Image').on('dragend', (event) => {
            const dragged_item = event.target;

            // If nothing's under the dragged item
            if (this.target == null) {
                dragged_item.x(this.dragStartX);
                dragged_item.y(this.dragStartY);
            }
            // Look up the possible interaction from interactions.json.
            else {
                const target_category = this.target.getAttr('category');

                const dragResolver = this.dragResolvers.filter(function (dragResolver) {
                    return dragResolver.getTargetCategory() === target_category;
                }).pop();

                if (dragResolver) {
                    this.commandsHandler.handleCommands(dragResolver.resolveCommands(
                        this.interactions,
                        dragged_item.id(),
                        this.target.id(),
                        this.target.id()
                    ));
                }
            }

            this.uiEventEmitter.emit('dragend_ended', this.dragged_item);
        });
        // Remove the dragged item if it was removed as a result of drag end -> interaction -> remove item
        this.gameEventEmitter.on('inventory_item_removed', ({ itemList: _itemList, itemNameRemoved }) => {
            if (this.dragged_item && this.dragged_item.attrs.id === itemNameRemoved) {
                this.dragged_item.hide();
                this.dragged_item = null;
            }
        });
        // Item Drag View Model end
        // Inventory & items view end

        // Character view start
        // Push character animation frames to correct layer.
        const characterLayer = this.stageObjectGetter.getObject("character_layer");
        const characterFrames = new CharacterFramesBuilder({ x: 764, y: 443 }).build(gameData.character_json.frames);
        konvaObjectLayerPusher.execute(characterFrames, characterLayer);
        // Creating all image objects from json
        imagePreparer.prepareImages(characterLayer.toObject());
        // Load up frames from json and set up CharacterAnimations view component
        const characterAnimationData = gameData.character_json.animations;
        const characterAnimations = new CharacterAnimationsBuilder(
            this.stageObjectGetter
        ).build(characterAnimationData);
        new CharacterAnimations(
            characterAnimations,
            this.uiEventEmitter,
            this.gameEventEmitter
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
        this.gameEventEmitter.on('monologue', (text) => {
            this.clearMonologues();
            this.setMonologue(text);
        });
        this.gameEventEmitter.on('npc_monologue', ({ npc, text }) => {
            this.clearMonologues();
            this.npcMonologue(npc, text);
        });
        this.uiEventEmitter.on('clicked_on_stage', () => {
            this.clearMonologues();
        });
        this.uiEventEmitter.on('inventory_drag_start', (_target) => {
            this.clearMonologues();
        });
        this.uiEventEmitter.on('dragmove_hover_on_object', (target) => {
            this.showTextOnDragMove(target);
        });
        this.uiEventEmitter.on('dragmove_hover_on_nothing', () => {
            this.clearInteractionText();
        });
        this.uiEventEmitter.on('dragend_ended', (_draggedItem) => {
            this.clearInteractionText();
        });
        // Text view end

        // Music view
        new Music(gameData.music_json, new AudioFactory(), this.uiEventEmitter, this.gameEventEmitter);
        // Music view end
        // View end

        // Controller(?) start
        this.text = new Text(gameData.text_json);
        this.interactions = new Interactions(gameData.interactions_json);
        this.uiEventEmitter.on('furniture_clicked', (target) => {
            this.handleClick(target);
        });
        this.uiEventEmitter.on('inventory_click', (target) => {
            this.handleClick(target);
        });
        const commandHandler = new CommandHandler(
            this.gameEventEmitter,
            this.uiEventEmitter,
            this.stageObjectGetter,
            this.text,
            gameData.items_json, // TODO: items model?
        );
        this.commandsHandler = new CommandsHandler(
            commandHandler
        )
        // Controller(?) end

        // Preparation done, final steps:
        this.stage.draw();
        this.commandsHandler.handleCommands(
            new DefaultInteractionResolver('start').resolveCommands(
                this.interactions,
                gameData.startInteraction,
                'start'
            )
        );
    }

    // Delay to be set after each intersection check
    setDelay(delay) {
        this.delayEnabled = true;
        setTimeout(() => this.delayEnabled = false, delay);
    }

    /**
     * TODO: move to text view component (or something)
     */
    clearInteractionText() {
        this.clearText(this.interaction_text);
    }

    /**
     * TODO: clean up and move to a view component (but which?)
     * @param {*} target
     */
    showTextOnDragMove(target) {
        this.interaction_text.text(this.text.getName(target.id()));
        this.interaction_text.x(this.dragged_item.x() + (this.dragged_item.width() / 2));
        this.interaction_text.y(this.dragged_item.y() - 30);
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

    /**
     * Handle click interactions on room objects, inventory items & any resolver category ...
     * @param {*} target
     */
    handleClick(target) {
        const targetCategory = target.getAttr('category');
        const clickResolver = this.clickResolvers.find(function (clickResolver) {
            return clickResolver.getTargetCategory() === targetCategory;
        });

        if (clickResolver) {
            this.commandsHandler.handleCommands(clickResolver.resolveCommands(
                this.interactions,
                target.id()
            ));
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
