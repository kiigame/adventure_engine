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

// TODO: Move DI up
import "reflect-metadata";
import { container, TYPES } from "./inversify.config.js";
import ItemsBuilder from './view/items/konvadata/ItemsBuilder.js';
import ItemBuilder from './view/items/konvadata/ItemBuilder.js';

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
                new HitRegionFilter([], ['Image'])
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
        this.music = new Music(gameData.music_json, new AudioFactory(), uiEventEmitter);
        this.text = new Text(gameData.text_json);
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

        // Timeout event for showing character animation for certain duration
        this.character_animation_timeout;

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

        // Animations
        // Animation for fading the screen
        this.fade_full;

        // Animation for fading the room portion of the screen
        this.fade_room;

        // List of animated objects
        this.animated_objects = [];

        // List of character animations.
        this.character_animations = []; // also accessed in latkazombit.js

        // Timeout event for showing character animation for certain duration
        this.character_animation_timeout;

        // Default character animations
        this.speakAnimationName = "speak";
        this.idleAnimationName = "idle";

        // Variable for saving the current layer (for changing backgrounds and object layers)
        this.current_layer;

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
        const faderRoomJson = {
            "attrs": {
                "id": "fader_room",
                "opacity": 0,
                "visible": false
            },
            "children": [
                {
                    "attrs": {
                        "height": 543,
                        "id": "black_screen_room",
                        "src": "data/images/black.png",
                        "width": 1024
                    },
                    "className": "Image"
                }
            ],
            "className": "Group"
        };
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
        layerJson = stageLayerChildAdder.add(
            layerJson,
            gameData.character_json.frames,
            'character_layer'
        );

        // Create stage and everything in it from json
        this.stage = Konva.Node.create(
            JSON.stringify(layerJson),
            'container'
        );

        // Define variables from stage for easier use

        // Texts & layers
        this.monologue = this.getObject("monologue");
        this.character_speech_bubble = this.getObject("character_speech_bubble");
        this.npc_monologue = this.getObject("npc_monologue");
        this.npc_speech_bubble = this.getObject("npc_speech_bubble");
        this.interaction_text = this.getObject("interaction_text");

        this.inventory_layer = this.getObject("inventory_layer");
        this.inventory_bar_layer = this.getObject("inventory_bar_layer");
        this.character_layer = this.getObject("character_layer");
        this.text_layer = this.getObject("text_layer");
        this.fader_full = this.getObject("fader_full");
        this.fader_room = this.getObject("fader_room");
        this.room_layer = this.getObject("room_layer");
        this.current_room = null;

        // Scale background and UI elements
        this.getObject("black_screen_full").size({ width: this.stage.width(), height: this.stage.height() });
        this.getObject("black_screen_room").size({ width: this.stage.width(), height: this.stage.height() - 100 });
        this.getObject("inventory_bar").y(this.stage.height() - 100);
        this.getObject("inventory_bar").width(this.stage.width());

        // Animation for fading the screen
        this.fade_full = new Konva.Tween({
            node: this.fader_full,
            duration: 0.6,
            opacity: 1
        });

        // Animation for fading the room portion of the screen
        this.fade_room = new Konva.Tween({
            node: this.fader_room,
            duration: 0.6,
            opacity: 1
        });

        // Load up frames from json to the character animations array.
        const characterAnimationData = gameData.character_json.animations;
        for (const i in characterAnimationData) {
            const frames = [];
            for (const j in characterAnimationData[i].frames) {
                const frame = new Konva.Tween({
                    node: this.getObject(characterAnimationData[i].frames[j].node),
                    duration: characterAnimationData[i].frames[j].duration
                });
                frames.push(frame);
            }
            this.character_animations[characterAnimationData[i].id] = frames;
        }

        // Set up onFinish functions for each frame to show the next frame. In the case
        // of the last of the frames, show the first frame.
        for (const i in this.character_animations) {
            for (let j = 0; j < this.character_animations[i].length; j++) {
                if (this.character_animations[i].length > j + 1) {
                    this.character_animations[i][j].onFinish = function () {
                        // `this` refers to the character_animations object,
                        // `self` refers to the engine object
                        for (const k in self.character_animations) {
                            if (self.character_animations[k].indexOf(this) > -1) {
                                const animation = self.character_animations[k];
                                const frame_index = self.character_animations[k].indexOf(this);
                                this.node.hide();
                                animation[frame_index + 1].node.show();
                                this.reset();
                                animation[frame_index + 1].play();
                            }
                        }
                    }
                } else {
                    this.character_animations[i][j].onFinish = function () {
                        for (const k in self.character_animations) {
                            if (self.character_animations[k].indexOf(this) > -1) {
                                const animation = self.character_animations[k];
                                this.node.hide();
                                animation[0].node.show();
                                this.reset();
                                animation[0].play();
                            }
                        }
                    }
                }
            }
        }

        // Creating all image objects from json file based on their attributes
        const imageData = this.stage.toObject();

        for (let i = 0; i < imageData.children.length; i++) {
            const container = imageData.children[i];
            if (['room_layer', 'sequence_layer'].includes(container.attrs.id)) {
                for (let j = 0; j < container.children.length; j++) {
                    const child = container.children[j];
                    this.prepareImages(child);
                }
            } else {
                this.prepareImages(container);
            }
        }

        // On window load we create image hit regions for our items on object layers
        window.onload = () => {
            this.hitRegionInitializer.initHitRegions(this, this.room_layer);
            this.stage.draw();
        };

        // Mouse up and touch end events (picking up items from the environment
        // Mouse click and tap events (examine items in the inventory)
        this.inventory_layer.on('click tap', (event) => {
            this.handle_click(event);
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
                    const leftArrow = this.getObject("inventory_left_arrow");
                    const rightArrow = this.getObject("inventory_right_arrow");
                    if (!this.dragDelayEnabled) {
                        if (this.intersection.check(this.dragged_item, leftArrow)) {
                            this.dragDelayEnabled = true;
                            this.inventory_index--;
                            this.redrawInventory();
                            setTimeout(() => this.dragDelayEnabled = false, this.dragDelay);
                        } else if (this.intersection.check(this.dragged_item, rightArrow)) {
                            this.dragDelayEnabled = true;
                            this.inventory_index++;
                            this.redrawInventory();
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

                this.current_layer.draw();
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

        /// Inventory arrow clicking events
        this.inventory_bar_layer.on('click tap', (event) => {
            this.handle_click(event);
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
                    return dragResolver.getTargetCategory() == target_category;
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

            this.redrawInventory();
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
        this.gameEventEmitter.on('do_transition', ({ room_id, fade_time }) => {
            this.do_transition(room_id, fade_time);
        });
        this.gameEventEmitter.on('play_sequence', (sequence_id) => {
            this.play_sequence(sequence_id);
        });
        this.gameEventEmitter.on('set_idle_animation', (animation_id) => {
            this.setIdleAnimation(animation_id);
        });
        this.gameEventEmitter.on('set_speak_animation', (animation_id) => {
            this.setSpeakAnimation(animation_id);
        });
        this.gameEventEmitter.on('npc_monologue', (npc, text) => {
            this.npcMonologue(npc, text);
        });

        // Set up event listeners for UI commands
        this.uiEventEmitter.on('play_full_fade_out', () => {
            // Animation cycle for proper fading and drawing order
            this.fade_full.reset();
            this.fader_full.show();
            this.fade_full.play();
        });
        this.uiEventEmitter.on('play_full_fade_in', () => {
            // Assumes fade_full has first faded out
            this.fade_full.reverse();
            setTimeout(() => {
                this.fader_full.hide();
            }, this.fade_full.tween.duration);
        });
        this.uiEventEmitter.on('hide_inventory', () => {
            this.inventory_layer.hide();
            this.inventory_bar_layer.hide();
        });
        this.uiEventEmitter.on('show_inventory', () => {
            this.inventory_layer.show();
            this.inventory_bar_layer.show();
            this.inventory_bar_layer.draw();
            this.inventory_layer.draw();
        });
        this.uiEventEmitter.on('hide_character', () => {
            this.character_layer.hide();
        });
        this.uiEventEmitter.on('show_character', () => {
            this.character_layer.show();
            this.character_layer.draw();
        });
        // Overriding default speaking animation from setMonologue from the same
        // interaction assumes: setMonologue is called first, and that events get
        // fired and handled in the same order ...
        this.uiEventEmitter.on('play_character_animation', ({ animationName, duration }) => {
            this.playCharacterAnimation(animationName, duration);
        });
        this.uiEventEmitter.on('reset_character_animation', () => {
            this.startCharacterAnimation(this.idleAnimationName);
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

    create_animation(object) {
        const attrs = object.getAttr("animation");
        const animation = new Konva.Tween({
            node: object,
            x: attrs.x ? object.x() + attrs.x : object.x(),
            y: attrs.y ? object.y() + attrs.y : object.y(),
            width: attrs.width ? object.width() - 15 : object.width(),
            easing: Konva.Easings.EaseInOut,
            duration: attrs.duration,

            onFinish: () => {
                animation.reverse();
                setTimeout(() => {
                    animation.play();
                }, attrs.duration * 1000);
            }
        });

        this.animated_objects.push(animation);
    }

    /**
     * Prepare images from a container (layer or group)
     * @param container
     */
    prepareImages(container) {
        for (let i = 0; i < container.children.length; i++) {
            const object = container.children[i];
            if (object.className == 'Image') {
                const { id, src: imageSrc, animated } = object.attrs;
                this.prepareImage(id, imageSrc, animated);
            }
        }
    }

    /**
     * Prepares Image class objects for the stage
     *
     * @param id
     * @param imageSrc
     * @param animated
     */
    prepareImage(id, imageSrc, animated) {
        this.createObject(id, imageSrc);

        if (animated === true) {
            this.create_animation(this.getObject(id));
        }
    }

    /** 
     * Playes a sequence definied in sequences.json by id.
     * @param {string} id The Sequence id in sequences.json
     */
    play_sequence(id) {
        let delay = 700;

        this.uiEventEmitter.emit('play_full_fade_out');

        const old_layer = this.current_layer;
        this.current_layer = this.getObject('sequence_layer');
        const currentSequence = this.getObject(id);
        const sequenceData = this.sequences_json[id];
        const final_fade_duration = sequenceData.transition_length != null ? sequenceData.transition_length : 0;
        let currentSlide = null;

        this.uiEventEmitter.emit('play_music_by_id', id);

        setTimeout(() => {
            this.uiEventEmitter.emit('hide_inventory');
            this.uiEventEmitter.emit('hide_character');
            old_layer.hide();
            // For the first slide, show sequence layer and sequence
            this.current_layer.show();
            currentSequence.show();
        }, delay);

        for (let i in sequenceData.slides) {
            let previousSlide = currentSlide;
            currentSlide = this.getObject(sequenceData.slides[i].id);

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
                    // Assumes sequences will always go to a room
                    this.uiEventEmitter.emit('show_inventory');
                    this.uiEventEmitter.emit('show_character');
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
                // Assumes sequences will always go to a room
                this.uiEventEmitter.emit('show_inventory');
                this.uiEventEmitter.emit('show_character');
                this.fader_full.hide();
            }, delay);
        }
    }

    /// Transition to a room.
    /// @param room_id The id of the room to transition to.
    /// @param fade_time The fade duration; if null, use a default.
    do_transition(room_id, fade_time) {
        const fadeDuration = fade_time === null || fade_time === undefined ? 700 : fade_time;

        // Don't fade if duration is zero
        if (fadeDuration) {
            this.fade_room.tween.duration = fadeDuration;
            this.fader_room.show();
            this.fade_room.play();
        }

        const previousLayer = this.current_layer;
        const previousRoom = this.current_room;
        this.current_layer = this.room_layer;
        this.current_room = this.getObject(room_id);

        setTimeout(() => {
            // Don't fade if duration is zero.
            if (fadeDuration) {
                this.fade_room.reverse();
                setTimeout(() => {
                    this.fader_room.hide();
                    this.current_layer.draw();
                }, fadeDuration);
            }

            if (previousLayer && previousLayer.id() !== this.room_layer.id()) {
                previousLayer.hide();
            }

            if (previousRoom) {
                previousRoom.hide();
            }

            // Play the animations of the room
            for (const i in this.animated_objects) {
                if (this.animated_objects[i].node.parent.id() == this.current_room.id()) {
                    this.animated_objects[i].play();
                } else if (this.animated_objects[i].anim.isRunning()) {
                    this.animated_objects[i].anim.stop(); // Should this be .anim.stop() or .pause()?
                }
            }

            this.current_layer.show();
            this.current_room.show();
            this.stage.draw();
            this.uiEventEmitter.emit('play_music_by_id', this.current_room.id());
        }, fadeDuration);
    }

    /// Handle click interactions on room objects, inventory items and inventory
    /// arrows.
    handle_click(event) {
        const target = event.target;
        const target_category = target.getAttr('category');

        const clickResolver = this.clickResolvers.filter(function (clickResolver) {
            return clickResolver.getTargetCategory() === target_category;
        }).pop();

        if (clickResolver) {
            this.handle_commands(clickResolver.resolveCommands(
                this.interactions,
                target.id()
            ));
            return;
        }

        // Inventory arrow buttons
        if (target.getAttr('id') == 'inventory_left_arrow') {
            if (target.getAttr('visible') == true) {
                this.inventory_index--;
                this.redrawInventory();
                return;
            }
        }

        if (target.getAttr('id') == 'inventory_right_arrow') {
            if (target.getAttr('visible') == true) {
                this.inventory_index++;
                this.redrawInventory();
                return;
            }
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
            const fade_time = command.length != null ? command.length : 700;
            const room_id = command.destination;
            this.gameEventEmitter.emit('do_transition', { room_id, fade_time });
        } else if (command.command == "play_sequence") {
            this.gameEventEmitter.emit('play_sequence', command.sequence);
        } else if (command.command == "set_idle_animation") {
            this.gameEventEmitter.emit('set_idle_animation', command.animation);
        } else if (command.command == "set_speak_animation") {
            this.gameEventEmitter.emit('set_speak_animation', command.animation);
        } else if (command.command == "npc_monologue") {
            const npc = this.getObject(command.npc);
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
        } else if (command.command === 'show_inventory') {
            this.uiEventEmitter.emit('show_inventory');
        } else if (command.command === 'show_character') {
            this.uiEventEmitter.emit('show_character');
        } else {
            console.warn("Unknown interaction command " + command.command);
        }
    }

    /// Get an object from stage by it's id. Gives an error message in console with
    /// the looked up name if it is not found. Basically, a wrapper for
    /// stage.find(id) with error messaging, helpful with typos in jsons,
    /// and also gives some errors if an object required by the kiigame.js script
    /// itself is missing.
    /// @param object The name of the object to look up.
    /// @return Returns the object if it's found, or null if it isn't.
    getObject(id) {
        const object = this.stage.find('#' + id)[0];
        if (object == null) {
            console.warn("Could not find object from stage with id " + id);
        }
        return object;
    }

    /**
     * Add an object to the stage. Currently, this means setting its visibility to true.
     * TODO: Add animations & related parts.
     * @param {string} objectName
     */
    addObject(objectName) {
        const object = this.getObject(objectName);
        object.clearCache();
        object.show();
        object.cache();
        this.current_layer.draw();
    }

    /**
     * Remove an object from stage. Called after interactions that remove objects.
     * The removed object is simply hidden. Handles animations.
     *
     * @param {string} objectName
     */
    removeObject(objectName) {
        this.removeAnimation(objectName);
        const object = this.getObject(objectName);
        object.hide();
        this.current_layer.draw();
    }

    /// Remove an object from the list of animated objects.
    /// @param id The id of the object to be de-animated.
    removeAnimation(id) {
        if (this.animated_objects.indexOf(id) > -1) {
            this.animated_objects.splice(this.animated_objects.indexOf(id), 1);
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

        const npc_tag = this.getObject("npc_tag");
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
            'play_character_animation',
            { animationName: this.speakAnimationName, duration: 3000 }
        );
    }

    /**
     * Start a character animation by name.
     */
    startCharacterAnimation(animationName) {
        // Hide and reset all character animations
        for (const i in this.character_animations) {
            for (const j in this.character_animations[i]) {
                this.character_animations[i][j].node.hide();
                this.character_animations[i][j].reset();
            }
        }

        const animation = this.character_animations[animationName];
        animation[0].node.show();
        animation[0].play();
        this.character_layer.draw();
    }

    /**
     * Play a character animation once and reset to idle.
     * @param {*} animationName The name of the animation to play.
     * @param {*} duration The time in ms until the character returns to idle animation.
     */
    playCharacterAnimation(animationName, duration) {
        this.startCharacterAnimation(animationName);
        clearTimeout(this.character_animation_timeout);
        this.character_animation_timeout = setTimeout(() => {
            this.uiEventEmitter.emit('reset_character_animation');
        }, duration);
    }

    /// Change idle animation, so that the character graphics can be changed
    /// mid-game.
    /// @param animation_name The name of the animation, look the animation up
    ///                       from this.character_animations[].
    setIdleAnimation(animation_name) {
        this.idleAnimationName = animation_name;
        this.uiEventEmitter.emit('reset_character_animation'); // reset and play the new idle animation
    }

    /// Change speak animation, so that the character graphics can be changed
    /// mid-game.
    /// @param animation_name The name of the animation, look the animation up
    ///                       from this.character_animations[].
    setSpeakAnimation(animation_name) {
        this.speakAnimationName = animation_name;
        this.uiEventEmitter.emit('reset_character_animation'); // reset and play idle animation
    }

    /**
     * Setting an image to the stage and scaling it based on relative values if they exist.
     * Comes up with width and height of the image if not set in json data. Needed by hit region
     * caching.
     */
    createObject(id, imageSrc) {
        window[id] = new Image();
        window[id].onload = () => {
            this.getObject(id).image(window[id]);
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
        const item = this.getObject(itemName);
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

        this.redrawInventory();
    }

    /**
     * Removing an item from the inventory. Dragged items are currently just
     * hidden, and inventory is redrawn only after drag ends.
     *
     * @param {string} itemName of the item to be removed from the inventory
     */
    inventoryRemove(itemName) {
        const item = this.getObject(itemName);
        item.hide();
        item.moveTo(this.current_layer);
        this.inventory_list.splice(this.inventory_list.indexOf(item), 1);
        this.redrawInventory();
    }

    // Dragging an item from the inventory
    inventoryDrag(item) {
        item.moveTo(this.current_layer);
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
            this.getObject("inventory_left_arrow").show();
        } else {
            this.getObject("inventory_left_arrow").hide();
        }

        if (this.inventory_index + this.inventory_max < this.inventory_list.length) {
            this.getObject("inventory_right_arrow").show();
        } else {
            this.getObject("inventory_right_arrow").hide();
        }

        this.inventory_bar_layer.draw();
        this.inventory_layer.draw();
        this.current_layer.draw();
    }

    // Delay to be set after each intersection check
    setDelay(delay) {
        this.delayEnabled = true;
        setTimeout(() => this.delayEnabled = false, delay);
    }
}
