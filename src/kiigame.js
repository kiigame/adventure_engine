import Konva from 'konva';

import LayerChildAdder from './view/stage/konvadata/LayerChildAdder.js';
import SequencesBuilder from './view/sequence/konvadata/SequencesBuilder.js';
import SequenceBuilder from './view/sequence/konvadata/SequenceBuilder.js';
import DefaultInteractionResolver from './model/DefaultInteractionResolver.js';
import Interactions from './model/Interactions.js';
import HitRegionInitializer from './view/stage/HitRegionInitializer.js';
import HitRegionFilter from './view/stage/hitregion/HitRegionFilter.js';
import Intersection from './view/Intersection.js';
import VisibilityValidator from './view/intersection/VisibilityValidator.js';
import CategoryValidator from './view/intersection/CategoryValidator.js';
import Music from './view/music/Music.js';
import AudioFactory from './view/music/AudioFactory.js';
import Text from './model/Text.js';
import EventEmitter from './events/EventEmitter.js';
import RoomAnimations from './view/room/RoomAnimations.js';
import ItemsBuilder from './view/items/konvadata/ItemsBuilder.js';
import ItemBuilder from './view/items/konvadata/ItemBuilder.js';
import RoomAnimationBuilder from './view/room/konvadata/RoomAnimationBuilder.js';
import RoomFaderBuilder from './view/stage/konvadata/RoomFaderBuilder.js';
import CharacterInRoom from './model/CharacterInRoom.js';
import StageObjectGetter from './view/stage/StageObjectGetter.js';
import CharacterAnimationsBuilder from './view/character/konvadata/CharacterAnimationsBuilder.js';
import CharacterAnimations from './view/character/CharacterAnimations.js';
import CharacterFramesBuilder from './view/character/konvadata/CharacterFramesBuilder.js';
import RoomFader from './view/room/RoomFader.js';

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

        this.interactions = new Interactions(gameData.interactions_json);
        this.music = new Music(gameData.music_json, new AudioFactory(), this.uiEventEmitter, this.gameEventEmitter);
        this.text = new Text(gameData.text_json);
        this.roomAnimations = new RoomAnimations(this.gameEventEmitter);
        this.roomAnimationBuilder = new RoomAnimationBuilder();

        let layerJson = gameData.layersJson;
        this.sequences_json = gameData.sequences_json;

        // Alternative variable for `this` to allow reference even when it's shadowed
        const self = this;

        // List of items in the inventory. inventory_list.length gives the item amount.
        this.inventory_list = [];
        // Offset from left for drawing inventory items starting from proper position
        this.offsetFromLeft = 50;
        // How many items the inventory can show at a time (7 with current settings)
        this.inventory_max = 7;
        // The item number where the shown items start from
        // (how many items from the beginning are not shown)
        this.inventory_index = 0;

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

        // Animation for fading the screen
        this.fade_full;

        // Build sequences and push them to the sequence layer
        const builtSequences = this.sequencesBuilder.build(this.sequences_json);
        const stageLayerChildAdder = new LayerChildAdder();
        layerJson = stageLayerChildAdder.add(
            layerJson,
            builtSequences,
            'sequence_layer'
        );
        // Push rooms into the room layer
        layerJson = stageLayerChildAdder.add(
            layerJson,
            gameData.rooms_json,
            'room_layer'
        );
        // Push room fader into the room layer after rooms, so it's on top
        const faderRoomJson = new RoomFaderBuilder().buildRoomFader();
        layerJson = stageLayerChildAdder.add(
            layerJson,
            [faderRoomJson],
            'room_layer'
        )
        // Build items and push them to the inventory item cache layer
        const items = this.itemsBuilder.build(gameData.items_json);
        layerJson = stageLayerChildAdder.add(
            layerJson,
            items,
            'inventory_item_cache'
        );
        // Push character animation frames to correct layer.
        const characterFrames = new CharacterFramesBuilder({ x: 764, y: 443 }).build(gameData.character_json.frames);
        layerJson = stageLayerChildAdder.add(
            layerJson,
            characterFrames,
            'character_layer'
        );

        // Create stage and everything in it from json
        this.stage = Konva.Node.create(
            JSON.stringify(layerJson),
            'container'
        );

        this.stageObjectGetter = new StageObjectGetter(this.stage);

        // Define variables from stage for easier use

        // Texts & layers
        this.monologue = this.stageObjectGetter.getObject("monologue");
        this.character_speech_bubble = this.stageObjectGetter.getObject("character_speech_bubble");
        this.npc_monologue = this.stageObjectGetter.getObject("npc_monologue");
        this.npc_speech_bubble = this.stageObjectGetter.getObject("npc_speech_bubble");
        this.interaction_text = this.stageObjectGetter.getObject("interaction_text");

        this.inventory_layer = this.stageObjectGetter.getObject("inventory_layer");
        this.inventory_bar_layer = this.stageObjectGetter.getObject("inventory_bar_layer");
        this.character_layer = this.stageObjectGetter.getObject("character_layer");
        this.text_layer = this.stageObjectGetter.getObject("text_layer");
        this.fader_full = this.stageObjectGetter.getObject("fader_full");
        this.room_layer = this.stageObjectGetter.getObject("room_layer");
        this.sequenceLayer = this.stageObjectGetter.getObject("sequence_layer");

        // The current room view
        this.current_room = null;
        // "Player character in room" model status
        this.characterInRoom = new CharacterInRoom(this.uiEventEmitter, this.gameEventEmitter);

        // Scale background and UI elements
        this.stageObjectGetter.getObject("black_screen_full").size({ width: this.stage.width(), height: this.stage.height() });
        this.stageObjectGetter.getObject("black_screen_room").size({ width: this.stage.width(), height: this.stage.height() - 100 });
        this.stageObjectGetter.getObject("inventory_bar").y(this.stage.height() - 100);
        this.stageObjectGetter.getObject("inventory_bar").width(this.stage.width());

        // Animation for fading the screen
        this.fade_full = new Konva.Tween({
            node: this.fader_full,
            duration: 0.6,
            opacity: 1
        });

        // Animation for fading the room portion of the screen
        const roomFaderNode = this.stageObjectGetter.getObject("fader_room");
        new RoomFader(
            roomFaderNode,
            this.uiEventEmitter,
            this.gameEventEmitter
        );

        // Load up frames from json to the character animations array.
        const characterAnimationData = gameData.character_json.animations;
        const characterAnimations = new CharacterAnimationsBuilder(
            this.stageObjectGetter
        ).build(characterAnimationData);
        this.characterAnimations = new CharacterAnimations(
            characterAnimations,
            this.uiEventEmitter,
            this.gameEventEmitter
        );

        // Prepare all room animations
        for (const child of this.room_layer.children) {
            if (child.attrs.category === 'room') {
                const newAnimations = this.prepareRoomAnimations(child);
                newAnimations.forEach((animation) => {
                    this.roomAnimations.animatedObjects.push(animation);
                })
            }
        }

        // Creating all image objects from json file based on their attributes
        const imageData = this.stage.toObject();
        for (const layer of imageData.children) {
            if (['room_layer', 'sequence_layer'].includes(layer.attrs.id)) {
                for (const child of layer.children) {
                    this.prepareImages(child);
                }
            } else {
                this.prepareImages(layer);
            }
        }

        // On window load we create image hit regions for furniture in rooms
        window.onload = () => {
            this.hitRegionInitializer.initHitRegions(this.room_layer);
            this.stage.draw();
        };

        // Handle clicks on inventory items and arrows arrows
        this.inventory_layer.on('click tap', (event) => {
            this.handle_click(event.target);
        });
        this.stageObjectGetter.getObject('inventory_left_arrow').on('click tap', () => {
            this.inventory_index--;
            this.uiEventEmitter.emit('redraw_inventory');
        });
        this.stageObjectGetter.getObject('inventory_right_arrow').on('click tap', () => {
            this.inventory_index++;
            this.uiEventEmitter.emit('redraw_inventory');
        });

        // Drag start events
        this.stage.find('Image').on('dragstart', (event) => {
            this.dragged_item = event.target;
            this.inventoryDrag(this.dragged_item);
        });

        // While dragging events (use item on item or object)
        this.stage.on('dragmove', (event) => {
            this.dragged_item = event.target;

            if (!this.delayEnabled) {
                // Setting a small delay to not spam intersection check on every moved pixel
                this.setDelay(10);

                // Loop through all the items on the current object layer
                for (let i = 0; i < this.current_room.children.length; i++) {
                    const object = (this.current_room.getChildren())[i];

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
                    // Loop through all the items on the inventory layer
                    for (let i = 0; i < this.inventory_layer.children.length; i++) {
                        const object = (this.inventory_layer.getChildren())[i];
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

                // Next, check the inventory_bar_layer, if the item is dragged over the inventory arrows
                if (this.target == null) {
                    const leftArrow = this.stageObjectGetter.getObject("inventory_left_arrow");
                    const rightArrow = this.stageObjectGetter.getObject("inventory_right_arrow");
                    if (!this.dragDelayEnabled) {
                        if (this.intersection.check(this.dragged_item, leftArrow)) {
                            this.dragDelayEnabled = true;
                            this.inventory_index--;
                            this.uiEventEmitter.emit('redraw_inventory');
                            setTimeout(() => this.dragDelayEnabled = false, this.dragDelay);
                        } else if (this.intersection.check(this.dragged_item, rightArrow)) {
                            this.dragDelayEnabled = true;
                            this.inventory_index++;
                            this.uiEventEmitter.emit('redraw_inventory');
                            setTimeout(() => this.dragDelayEnabled = false, this.dragDelay);
                        } else {
                            this.target = null;
                        }
                    }
                    this.clearText(this.interaction_text);
                }

                // If target is found, highlight it and show the interaction text
                if (this.target != null) {
                    this.current_room.getChildren().each((shape, i) => {
                        shape.shadowBlur(0);
                    });
                    this.inventory_layer.getChildren().each((shape, i) => {
                        shape.shadowBlur(0);
                    });
                    this.target.clearCache();
                    this.target.shadowColor('purple');
                    this.target.shadowOffset({ x: 0, y: 0 });
                    this.target.shadowBlur(20);
                    this.inventory_layer.draw();

                    this.interaction_text.text(this.text.getName(this.target.id()));

                    this.interaction_text.x(this.dragged_item.x() + (this.dragged_item.width() / 2));
                    this.interaction_text.y(this.dragged_item.y() - 30);
                    this.interaction_text.offset({
                        x: this.interaction_text.width() / 2
                    });

                    this.text_layer.draw();
                } else {
                    // If no target, clear the texts and highlights
                    this.current_room.getChildren().each((shape, i) => {
                        shape.shadowBlur(0);
                    });
                    this.inventory_layer.getChildren().each((shape, i) => {
                        shape.shadowBlur(0);
                    });
                    this.clearText(this.interaction_text);
                }

                this.room_layer.draw();
            }
        });

        /// Stop character animations and clear monologue when clicked or touched
        /// anywhere on the screen.
        this.stage.on('touchstart mousedown', () => {
            this.clearText(this.monologue);
            this.clearText(this.npc_monologue);
            this.uiEventEmitter.emit('reset_character_animation');
        });

        /// Touch start and mouse down events (save the coordinates before dragging)
        this.inventory_layer.on('touchstart mousedown', (event) => {
            this.dragStartX = event.target.x();
            this.dragStartY = event.target.y();
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

            // Clearing the glow effects
            this.current_room.getChildren().each((shape, i) => {
                shape.shadowBlur(0);
            });
            this.inventory_layer.getChildren().each((shape, i) => {
                shape.shadowBlur(0);
            });
            // Clearing the texts
            this.clearText(this.interaction_text);

            this.uiEventEmitter.emit('redraw_inventory');
        });

        // Set up event listeners for the gameplay commands
        this.gameEventEmitter.on('monologue', (text) => {
            this.setMonologue(text);
        });
        this.gameEventEmitter.on('inventory_add', (itemName) => {
            this.inventoryAdd(itemName);
        });
        this.gameEventEmitter.on('inventory_remove', (itemName) => {
            this.inventoryRemove(itemName);
        });
        this.gameEventEmitter.on('remove_object', (objectName) => {
            this.removeObject(objectName);
        });
        this.gameEventEmitter.on('add_object', (objectName) => {
            this.addObject(objectName);
        });
        this.gameEventEmitter.on('play_sequence', (sequence_id) => {
            this.play_sequence(sequence_id);
        });
        this.gameEventEmitter.on('npc_monologue', (npc, text) => {
            this.npcMonologue(npc, text);
        });
        this.gameEventEmitter.on('left_room', (from) => {
            this.hidePreviousRoom(from);
        });
        this.gameEventEmitter.on('arrived_in_room', (roomId) => {
            this.sequenceLayer.hide();
            this.showRoom(roomId);
            // Slightly kludgy way of checking if we want to show inventory and character
            if (this.stageObjectGetter.getObject(roomId).attrs.fullScreen) {
                return;
            }
            this.showInventory();
            this.showCharacter();
        });

        // Set up event listeners for UI commands
        this.uiEventEmitter.on('play_full_fade_out', () => {
            this.playFullFadeOut();
        });
        this.uiEventEmitter.on('play_sequence_started', (_id) => {
            this.playFullFadeOut();
        });
        this.uiEventEmitter.on('first_sequence_slide_shown', () => {
            this.hideCharacter();
            this.hideInventory();
            this.sequenceLayer.show();
        });
        this.uiEventEmitter.on('play_full_fade_in', () => {
            // Assumes fade_full has first faded out
            this.fade_full.reverse();
            setTimeout(() => {
                this.fader_full.hide();
            }, this.fade_full.tween.duration);
        });
        this.uiEventEmitter.on('redraw_inventory', () => {
            this.redrawInventory();
        });
        this.uiEventEmitter.on('room_fade_in_done', () => {
            this.drawRoomLayer();
        });
        this.uiEventEmitter.on('furniture_clicked', (target) => {
            this.handle_click(target);
        });
        this.uiEventEmitter.on('character_animation_started', () => {
            this.drawCharacterLayer();
        });

        this.stage.draw();
        this.handle_commands(
            this.startInteractionResolver.resolveCommands(
                this.interactions,
                gameData.startInteraction,
                'start'
            )
        );
    }

    /**
     * TODO: move to character view component (or stage manager?)
     */
    showCharacter() {
        this.character_layer.show();
        this.character_layer.draw();
    }

    /**
     * TODO: move to character view component (or stage manager?)
     */
    hideCharacter() {
        this.character_layer.hide();
    }

    /**
     * TODO: move to inventory view component (or stage manager?)
     */
    showInventory() {
        this.inventory_layer.show();
        this.inventory_bar_layer.show();
        this.inventory_bar_layer.draw();
        this.inventory_layer.draw();
    }

    /**
     * TODO: move to inventory view component (or stage manager?)
     */
    hideInventory() {
        this.inventory_layer.hide();
        this.inventory_bar_layer.hide();
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
     * Prepare the animations for a room
     * @param {Konva.Group} room
     * @returns {Konva.Tween[]} An array of room animations
     */
    prepareRoomAnimations(room) {
        const roomAnimations = [];
        for (const object of room.children) {
            if (object.className == 'Image' && object.attrs.animated) {
                const animation = this.roomAnimationBuilder.createRoomAnimation(
                    this.stageObjectGetter.getObject(object.attrs.id)
                );
                roomAnimations.push(animation);
            }
        }
        return roomAnimations;
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
     * TODO: move to a "stage manager" view component
     * @param {string} from room id of the room we have faded out
     */
    hidePreviousRoom(from) {
        const room = this.stageObjectGetter.getObject(from);
        room.hide();
    }

    /**
     * TODO: move to a "stage manager" view component
     * @param {string} roomId room to make visible
     */
    showRoom(roomId) {
        const room = this.stageObjectGetter.getObject(roomId);
        room.show();
        this.current_room = room;
        this.stage.draw();
    }

    /**
     * TODO: move to a "stage manager" view component
     */
    drawRoomLayer() {
        this.room_layer.draw();
    }

    /**
     * TODO: move to a "stage manager" view component
     */
    drawCharacterLayer() {
        this.character_layer.draw();
    }

    /// Handle click interactions on room objects, inventory items and inventory
    /// arrows.
    handle_click(target) {
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
            this.gameEventEmitter.emit('npc_monologue', npc, text);
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

    /**
     * Add an object to the stage. Currently, this means setting its visibility to true.
     * TODO: Add animations & related parts.
     * @param {string} objectName
     */
    addObject(objectName) {
        const object = this.stageObjectGetter.getObject(objectName);
        object.clearCache();
        object.show();
        object.cache();
        this.room_layer.draw();
    }

    /**
     * Remove an object from stage. Called after interactions that remove objects.
     * The removed object is simply hidden.
     *
     * @param {string} objectName
     */
    removeObject(objectName) {
        const object = this.stageObjectGetter.getObject(objectName);
        object.hide();
        this.room_layer.draw();
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
            this.npc_monologue.text(text);
            this.npc_speech_bubble.x(npc.x());
        } else {
            npc_tag.pointerDirection("left");
            if (this.npc_monologue.width() > this.stage.width() - (npc.x() + npc.width() + 100)) {
                this.npc_monologue.width(this.stage.width() - (npc.x() + npc.width() + 100));
            }
            this.npc_monologue.text(text);
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
     * Adding an item to the inventory. Adds new items, but also an item that
     * has been dragged out of the inventory is put back with this function.
     * May become problematic if interaction both returns the dragged item
     * and adds a new one.
     *
     * @param {string} itemName The name of the item to be added to the inventory.
     */
    inventoryAdd(itemName) {
        const item = this.stageObjectGetter.getObject(itemName);
        item.show();
        item.moveTo(this.inventory_layer);
        item.clearCache();
        item.size({ width: 80, height: 80 });

        if (this.inventory_list.indexOf(item) > -1) {
            this.inventory_list.splice(this.inventory_list.indexOf(item), 1, item);
        } else {
            this.inventory_list.push(item);
        }

        // The picked up item should be visible in the inventory. Scroll inventory
        // to the right if necessary.
        if (this.inventory_list.indexOf(item) > this.inventory_index + this.inventory_max - 1) {
            this.inventory_index = Math.max(this.inventory_list.indexOf(item) + 1 - this.inventory_max, 0);
        }

        this.uiEventEmitter.emit('redraw_inventory');
    }

    /**
     * Removing an item from the inventory. Dragged items are currently just
     * hidden, and inventory is redrawn only after drag ends.
     *
     * @param {string} itemName of the item to be removed from the inventory
     */
    inventoryRemove(itemName) {
        const itemToRemove = this.stageObjectGetter.getObject(itemName);
        itemToRemove.hide();
        itemToRemove.moveTo(this.room_layer); // but why?
        this.inventory_list = this.inventory_list.filter((item) => itemToRemove !== item);
        this.uiEventEmitter.emit('redraw_inventory');
    }

    // Dragging an item from the inventory
    inventoryDrag(item) {
        item.moveTo(this.room_layer); // are we sure?
        this.inventory_bar_layer.draw();
        this.inventory_layer.draw();
        this.clearText(this.monologue);
        this.clearText(this.npc_monologue);
        this.uiEventEmitter.emit('reset_character_animation');
    }

    /**
     * Manages which inventory items are shown. There's limited space in the UI,
     * and we may have an arbitrary number of items in the inventory. Shows the
     * items that should be visible according to inventory_index and takes care
     * of showing inventory arrows as necessary.
     */
    redrawInventory() {
        // At first reset all items. Adding or removing items, as well as clicking
        // arrows, may change which items should be shown.
        this.inventory_layer.getChildren().each((shape, i) => {
            shape.setAttr('visible', false);
        });

        // If the left arrow is visible AND there's empty space to the right,
        // scroll the inventory to the left. This should happen when removing items.
        if (this.inventory_index + this.inventory_max > this.inventory_list.length) {
            this.inventory_index = Math.max(this.inventory_list.length - this.inventory_max, 0);
        }

        for (let i = this.inventory_index; i < Math.min(this.inventory_index + this.inventory_max, this.inventory_list.length); i++) {
            const shape = this.inventory_list[i];
            shape.x(this.offsetFromLeft + (this.inventory_list.indexOf(shape) - this.inventory_index) * 100);
            shape.y(this.stage.height() - 90);
            shape.setAttr('visible', true);
        }

        if (this.inventory_index > 0) {
            this.stageObjectGetter.getObject("inventory_left_arrow").show();
        } else {
            this.stageObjectGetter.getObject("inventory_left_arrow").hide();
        }

        if (this.inventory_index + this.inventory_max < this.inventory_list.length) {
            this.stageObjectGetter.getObject("inventory_right_arrow").show();
        } else {
            this.stageObjectGetter.getObject("inventory_right_arrow").hide();
        }

        this.inventory_bar_layer.draw();
        this.inventory_layer.draw();
        this.room_layer.draw();
    }

    // Delay to be set after each intersection check
    setDelay(delay) {
        this.delayEnabled = true;
        setTimeout(() => this.delayEnabled = false, delay);
    }
}
