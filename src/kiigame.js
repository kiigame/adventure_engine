import Konva from 'konva';

import SequencesBuilder from './view/sequence/konvadata/SequencesBuilder.js';
import SequenceBuilder from './view/sequence/konvadata/SequenceBuilder.js';
import DefaultInteractionResolver from './controller/DefaultInteractionResolver.js';
import Interactions from './controller/Interactions.js';
import HitRegionInitializer from './view/stage/HitRegionInitializer.js';
import HitRegionFilter from './view/stage/hitregion/HitRegionFilter.js';
import Intersection from './view/Intersection.js';
import VisibilityValidator from './view/intersection/VisibilityValidator.js';
import CategoryValidator from './view/intersection/CategoryValidator.js';
import Music from './view/music/Music.js';
import AudioFactory from './view/music/AudioFactory.js';
import Text from './controller/Text.js';
import EventEmitter from './events/EventEmitter.js';
import ItemsBuilder from './view/items/konvadata/ItemsBuilder.js';
import ItemBuilder from './view/items/konvadata/ItemBuilder.js';
import RoomAnimationBuilder from './view/room/konvadata/RoomAnimationBuilder.js';
import RoomAnimationsBuilder from './view/room/konvadata/RoomAnimationsBuilder.js';
import RoomAnimations from './view/room/RoomAnimations.js';
import RoomFaderBuilder from './view/stage/konvadata/RoomFaderBuilder.js';
import RoomFader from './view/room/RoomFader.js';
import CharacterInRoom from './model/CharacterInRoom.js';
import StageObjectGetter from './view/stage/StageObjectGetter.js';
import CharacterFramesBuilder from './view/character/konvadata/CharacterFramesBuilder.js';
import CharacterAnimationsBuilder from './view/character/konvadata/CharacterAnimationsBuilder.js';
import CharacterAnimations from './view/character/CharacterAnimations.js';
import InventoryView from './view/InventoryView.js';
import RoomView from './view/room/RoomView';

// TODO: Move DI up
import "reflect-metadata";
import { container, TYPES } from "./inversify.config.js";

export class KiiGame {
    constructor(
        sequencesBuilder = null,
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
        this.sequencesBuilder = sequencesBuilder;
        this.itemsBuilder = itemsBuilder;
        this.clickResolvers = clickResolvers;
        this.dragResolvers = dragResolvers;
        this.hitRegionInitializer = hitRegionInitializer;
        this.intersection = intersection;
        this.gameEventEmitter = gameEventEmitter;
        this.uiEventEmitter = uiEventEmitter;

        if (this.sequencesBuilder === null) {
            // TODO: Move DI up
            const slideBuilder = container.get(TYPES.SlideBuilder);
            this.sequencesBuilder = new SequencesBuilder(
                new SequenceBuilder(
                    slideBuilder
                )
            );
        }
        if (this.itemsBuilder === null) {
            this.itemsBuilder = new ItemsBuilder(
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
        this.startInteractionResolver = new DefaultInteractionResolver('start');

        if (this.hitRegionInitializer === null) {
            this.hitRegionInitializer = new HitRegionInitializer(
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
        // Model end

        // View start
        // Stage view start
        this.stage = Konva.Node.create(
            JSON.stringify(gameData.layersJson),
            'container'
        );
        this.stageObjectGetter = new StageObjectGetter(this.stage);
        this.fader_full = this.stageObjectGetter.getObject("fader_full");
        this.prepareImages(this.fader_full);
        // Scale full screen fader
        this.stageObjectGetter.getObject("black_screen_full").size({ width: this.stage.width(), height: this.stage.height() });
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
        this.uiEventEmitter.on('play_full_fade_in', () => {
            // Assumes fade_full has first faded out
            this.fade_full.reverse();
            setTimeout(() => {
                this.fader_full.hide();
            }, this.fade_full.tween.duration);
        });
        this.uiEventEmitter.on('room_hit_regions_initialized', () => {
            this.stage.draw();
        });
        // Stage view end

        // Sequences start
        // Build sequences and push them to the sequence layer
        this.sequences_json = gameData.sequences_json;
        const builtSequences = this.sequencesBuilder.build(this.sequences_json);
        this.sequenceLayer = this.stageObjectGetter.getObject("sequence_layer");
        builtSequences.forEach((builtSequence) => {
            Konva.Node.create(
                JSON.stringify(builtSequence),
            ).moveTo(this.sequenceLayer);
        })
        // Creating sequence image objects
        for (const child of this.sequenceLayer.toObject().children) {
            this.prepareImages(child);
        }
        this.gameEventEmitter.on('arrived_in_room', (roomId) => {
            this.sequenceLayer.hide();
        });
        this.gameEventEmitter.on('play_sequence', (sequence_id) => {
            this.play_sequence(sequence_id);
        });
        // Sequences end

        // Rooms view start
        // Build rooms
        const roomLayer = this.stageObjectGetter.getObject("room_layer");
        gameData.rooms_json.forEach((roomJson) => {
        Konva.Node.create(
            JSON.stringify(roomJson)
        ).moveTo(roomLayer);
        });
        Konva.Node.create(
            JSON.stringify(new RoomFaderBuilder().buildRoomFader())
        ).moveTo(roomLayer);
        // Prepare room object images
        for (const child of roomLayer.toObject().children) {
            this.prepareImages(child);
        }
        // Room view component
        this.roomView = new RoomView(
            this.uiEventEmitter,
            this.gameEventEmitter,
            this.hitRegionInitializer,
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
        const items = this.itemsBuilder.build(gameData.items_json);
        items.forEach((item) => {
            Konva.Node.create(
              JSON.stringify(item)
         ).moveTo(inventoryItemCache);
        });
        // Creating all item image objects from json
        this.prepareImages(inventoryItemCache.toObject());
        // Set the drag start listener -> ui event emitting for the prospective inventory items
        inventoryItemCache.find('Image').on('dragstart', (event) => {
            this.uiEventEmitter.emit('inventory_drag_start', event.target);
        });
        const inventoryBarLayer = this.stageObjectGetter.getObject('inventory_bar_layer');
        this.prepareImages(inventoryBarLayer.toObject());
        // Scale inventory bar to stage
        this.stageObjectGetter.getObject("inventory_bar").y(this.stage.height() - 100);
        this.stageObjectGetter.getObject("inventory_bar").width(this.stage.width());
        // Inventory view component
        this.inventoryView = new InventoryView(
            this.uiEventEmitter,
            this.gameEventEmitter,
            this.stageObjectGetter,
            inventoryBarLayer,
            this.stage.height() - 90
        );
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
        // Inventory & items view end

        // Character view start
        // Push character animation frames to correct layer.
        this.character_layer = this.stageObjectGetter.getObject("character_layer");
        const characterFrames = new CharacterFramesBuilder({ x: 764, y: 443 }).build(gameData.character_json.frames);
        characterFrames.forEach((characterFrame) => {
            Konva.Node.create(
                JSON.stringify(characterFrame)
            ).moveTo(this.character_layer);
        });
        // Creating all image objects from json
        this.prepareImages(this.character_layer.toObject());
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
        this.uiEventEmitter.on('character_animation_started', () => {
            this.drawCharacterLayer();
        });
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
        this.gameEventEmitter.on('npc_monologue', ({npc, text}) => {
            this.clearMonologues();
            this.npcMonologue(npc, text);
        });
        this.uiEventEmitter.on('clicked_on_stage', () => {
            this.clearMonologues();
        });
        this.uiEventEmitter.on('dragmove_hover_on_object', (target) => {
            this.showTextOnDragMove(target);
        });
        this.uiEventEmitter.on('dragmove_hover_on_nothing', () => {
            this.clearInteractionText();
        });
        this.uiEventEmitter.on('dragend_ended', () => {
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
        // Controller(?) end

        // To be refactored - split into appropriate components
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
                    const visibleInventoryItems = this.inventoryView.getVisibleInventoryItems();
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

        /// Drag end events for inventory items.
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
                    this.handle_commands(dragResolver.resolveCommands(
                        this.interactions,
                        dragged_item.id(),
                        this.target.id(),
                        this.target.id()
                    ));
                }
            }

            // Check if dragged item's destroyed, if not, add it back to inventory
            if (dragged_item.isVisible()) {
                this.gameEventEmitter.emit('inventory_add', dragged_item.id());
            }

            this.uiEventEmitter.emit('dragend_ended');
        });

        this.uiEventEmitter.on('current_room_changed', (room) => {
            this.stage.draw();
            // Slightly kludgy way of checking if we want to show character
            if (room.attrs.fullScreen) {
                return;
            }
            this.showCharacter();
        });
        this.uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.hideCharacter();
            this.sequenceLayer.show();
        });
        this.uiEventEmitter.on('inventory_drag_start', (target) => {
            this.dragged_item = target;
            this.clearMonologues();
        });
        this.uiEventEmitter.on('inventory_touchstart', (target) => {
            this.dragStartX = target.x();
            this.dragStartY = target.y();
        });
        // To be refactored - end

        // Preparation done, final steps:
        this.stage.draw();
        this.handle_commands(
            this.startInteractionResolver.resolveCommands(
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
     * TODO: move to character view component
     */
    showCharacter() {
        this.character_layer.show();
        this.drawCharacterLayer();
    }

    /**
     * TODO: move to character view component
     */
    hideCharacter() {
        this.character_layer.hide();
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
     * Prepare images from a container (layer or group)
     * @param {Konva.Node} container
     */
    prepareImages(container) {
        for (const object of container.children) {
            if (object.className == 'Image') {
                this.loadImageObject(object.attrs.id, object.attrs.src);
            }
        }
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
                        this.uiEventEmitter.emit('play_full_fade_out');
                    }

                    // Show current slide (note stage.draw only below)
                    currentSlide.show();

                    // Fade in?
                    const slideFade = sequenceData.slides[i].do_fade;
                    if (slideFade === true) {
                        setTimeout(() => {
                            this.uiEventEmitter.emit('play_full_fade_in');
                            this.stage.draw();
                        }, this.fade_full.tween.duration);
                    } else {
                        // Immediately display the slide
                        this.fade_full.reset();
                        this.stage.draw();
                    }
                }, delay);
            }
            displaySlide(i, currentSlide, previousSlide);

            delay = delay + sequenceData.slides[i].show_time;
        };

        // After last slide, do the final fade
        if (final_fade_duration > 0) {
            setTimeout(() => {
                this.fade_full.tween.duration = final_fade_duration;
                this.fade_full.play();

                setTimeout(() => {
                    this.uiEventEmitter.emit('play_full_fade_in');
                    setTimeout(() => {
                        this.fade_full.tween.duration = 600; // reset to default
                    }, final_fade_duration);
                }, final_fade_duration);
            }, delay);

            // Doesn't include the fade-in!
            delay = delay + final_fade_duration;
        } else {
            setTimeout(() => {
                this.fader_full.hide();
            }, delay);
        }
    }

    /**
     * TODO: move to a character view component
     */
    drawCharacterLayer() {
        this.character_layer.draw();
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
            this.handle_commands(clickResolver.resolveCommands(
                this.interactions,
                target.id()
            ));
        }
    }

    /// Loop through a list of interaction commands and execute them with
    /// handle_command, with timeout if specified.
    handle_commands(commands) {
        for (const i in commands) {
            if (commands[i].timeout != null) {
                ((commands, i) => {
                    setTimeout(() => {
                        this.handle_command(commands[i]);
                    }, commands[i].timeout);
                })(commands, i);
            } else {
                this.handle_command(commands[i]);
            }
        }
    }

    /// Handle each interaction. Check what command is coming in, and do the thing.
    /// Timeouts are done in handle_commands. Order of commands in interactions.json
    /// can be important: for instance, monologue plays the speaking animation, so
    /// play_character_animation should come after it, so that the speaking
    /// animation is stopped and the defined animation plays, and not vice versa.
    handle_command(command) {
        if (command.command == "monologue") {
            const text = this.text.getText(command.textkey.object, command.textkey.string);
            this.gameEventEmitter.emit('monologue', text);
        } else if (command.command == "inventory_add") {
            const items = Array.isArray(command.item) ? command.item : [command.item];
            items.forEach((itemName) =>
                this.gameEventEmitter.emit('inventory_add', itemName)
            );
        } else if (command.command == "inventory_remove") {
            const items = Array.isArray(command.item) ? command.item : [command.item];
            items.forEach((itemName) =>
                this.gameEventEmitter.emit('inventory_remove', itemName)
            );
        } else if (command.command == "remove_object") {
            const objects = Array.isArray(command.object) ? command.object : [command.object];
            objects.forEach((objectName) =>
                this.gameEventEmitter.emit('remove_object', objectName)
            );
        } else if (command.command == "add_object") {
            const objects = Array.isArray(command.object) ? command.object : [command.object];
            objects.forEach((objectName) =>
                this.gameEventEmitter.emit('add_object', objectName)
            );
        } else if (command.command == "do_transition") {
            if (command.instant) {
                this.gameEventEmitter.emit('do_instant_transition', {
                    roomId: command.destination
                });
                return;
            }
            this.gameEventEmitter.emit('do_transition', {
                roomId: command.destination
            });
        } else if (command.command == "play_sequence") {
            this.gameEventEmitter.emit('play_sequence', command.sequence);
        } else if (command.command == "set_idle_animation") {
            this.gameEventEmitter.emit('set_idle_animation', command.animation);
        } else if (command.command == "set_speak_animation") {
            this.gameEventEmitter.emit('set_speak_animation', command.animation);
        } else if (command.command == "npc_monologue") {
            const npc = this.stageObjectGetter.getObject(command.npc);
            const text = this.text.getText(command.textkey.object, command.textkey.string);
            this.gameEventEmitter.emit('npc_monologue', {npc, text});
        } else if (command.command == "play_character_animation") {
            const animationName = command.animation;
            const duration = command.length;
            this.uiEventEmitter.emit('play_character_animation', { animationName, duration });
        } else if (command.command == "play_music") {
            const musicParams = {
                music: command.music,
                loop: command.loop !== undefined ? command.loop : false,
                fade: command.fade !== undefined ? command.fade : 0
            };
            this.uiEventEmitter.emit('play_music', musicParams);
        } else if (command.command === 'play_full_fade_out') {
            this.uiEventEmitter.emit('play_full_fade_out');
        } else if (command.command === 'play_full_fade_in') {
            this.uiEventEmitter.emit('play_full_fade_in');
        } else {
            console.warn("Unknown interaction command " + command.command);
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
     * Loads an image for the stage and sets up its onload handler.
     * The image is cached globally to ensure it stays in memory while loading.
     * @param {string} id - The identifier for the image object
     * @param {string} imageSrc - The source URL of the image
     */
    loadImageObject(id, imageSrc) {
        window[id] = new Image();
        window[id].onload = () => {
            this.stageObjectGetter.getObject(id).image(window[id]);
        };
        window[id].src = imageSrc;
    }

    /**
     * TODO: move to (a) view component(s)
     */
    clearMonologues() {
        this.clearText(this.monologue);
        this.clearText(this.npc_monologue);
    }
}
