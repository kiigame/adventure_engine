import Konva from 'konva';

import JSONGetter from './util/JSONGetter.js';
import LayerAdder from './view/stage/konvadata/LayerAdder.js';
import LayerChildAdder from './view/stage/konvadata/LayerChildAdder.js';
import SequencesBuilder from './view/sequence/konvadata/SequencesBuilder.js';
import SequenceBuilder from './view/sequence/konvadata/SequenceBuilder.js';
import SlideBuilder from './view/sequence/konvadata/SlideBuilder.js';
import TextBuilder from './view/sequence/konvadata/TextBuilder.js';


export class KiiGame {
    constructor(jsonGetter = null, sequencesBuilder = null) {
        this.jsonGetter = jsonGetter;
        this.sequencesBuilder = sequencesBuilder;

        if (this.jsonGetter === null) {
            this.jsonGetter = new JSONGetter();
        }
        if (this.sequencesBuilder === null) {
            this.sequencesBuilder = new SequencesBuilder(
                new SequenceBuilder(
                    new SlideBuilder(
                        new TextBuilder()
                    )
                )
            );
        }

        // Alternative variable for `this` to allow reference even when it's shadowed
        var self = this;

        // The amount of rewards found. LZ specific, TODO refactor
        this.rewards = 0;

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

        // Music
        // Different browsers and different browser versions support different formats. MP3 should work with in all the major
        // browsers in current versions.
        this.current_music;
        this.current_music_source;

        // Menu
        this.menu; // also accessed in latkazombit.js
        // Track the currently shown menu
        this.current_menu;

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
        this.speak_animation;
        this.idle_animation;

        // Variable for saving the current room (for changing backgrounds and object layers)
        this.current_layer;
        this.current_background;
        this.game_start_layer; // also accessed in latkazombit.js
        this.start_layer; // also accessed in latkazombit.js

        // List of animated objects
        this.animated_objects = [];

        // List of character animations.
        this.character_animations = []; // also accessed in latkazombit.js

        // Get jsons from the server
        this.images_json = JSON.parse(this.getJSON('images.json'));
        this.rooms_json = JSON.parse(this.getJSON('rooms.json'))['rooms'];
        this.texts_json = JSON.parse(this.getJSON('texts.json'));
        this.interactions_json = JSON.parse(this.getJSON('interactions.json'));
        this.character_json = JSON.parse(this.getJSON('character.json'));
        this.sequences_json = JSON.parse(this.getJSON('sequences.json'));
        this.music_json = JSON.parse(this.getJSON('music.json'));
        this.menu_json = JSON.parse(this.getJSON('menu.json'));
        this.items_json = JSON.parse(this.getJSON('items.json'));

        // Add rooms to images_json for stage building. Add them before the room
        // fade layer to ensure correct draw order.
        var stageLayerAdder = new LayerAdder();
        this.images_json = stageLayerAdder.process(
            this.images_json,
            this.rooms_json,
            'fade_layer_room'
        );

        // Build an array of all the sequences out of sequences_json and merge them to
        // images_json for stage building.
        var builtSequences = this.sequencesBuilder.build(this.sequences_json);
        this.images_json = stageLayerAdder.process(
            this.images_json,
            builtSequences,
            'start_layer_menu' // TODO: Use fade_layer_full ?
        );

        // Push items.json contents to correct layer.
        var stageLayerChildAdder = new LayerChildAdder();
        this.images_json = stageLayerChildAdder.add(
            this.images_json,
            this.items_json,
            'inventory_item_cache'
        );
        // Push character animation frames to correct layer.
        this.images_json = stageLayerChildAdder.add(
            this.images_json,
            this.character_json.frames,
            'character_layer'
        );

        // Create stage and everything in it from json
        this.images_json_text = JSON.stringify(this.images_json);
        this.stage = Konva.Node.create(this.images_json_text, 'container');

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
        this.fade_layer_full = this.getObject("fade_layer_full");
        this.fade_layer_room = this.getObject("fade_layer_room");

        // Scale background and UI elements
        this.getObject("black_screen_full").size({width: this.stage.width(), height: this.stage.height()});
        this.getObject("black_screen_room").size({width: this.stage.width(), height: this.stage.height() - 100});
        this.getObject("inventory_bar").y(this.stage.height() - 100);
        this.getObject("inventory_bar").width(this.stage.width());

        // Animation for fading the screen
        this.fade_full = new Konva.Tween({
            node : this.fade_layer_full,
            duration : 0.6,
            opacity : 1
        });

        // Animation for fading the room portion of the screen
        this.fade_room = new Konva.Tween({
            node : this.fade_layer_room,
            duration : 0.6,
            opacity : 1
        });

        // Load up frames from json to the character animations array.
        var animation_data = this.character_json.animations;
        for (var i in animation_data) {
            var frames = [];
            for (var j in animation_data[i].frames) {
                var frame = new Konva.Tween({
                    node: this.getObject(animation_data[i].frames[j].node),
                    duration: animation_data[i].frames[j].duration
                });
                frames.push(frame);
            }
           this.character_animations[animation_data[i].id] = frames;
        }

        // Set up onFinish functions for each frame to show the next frame. In the case
        // of the last of the frames, show the first frame.
        for (var i in this.character_animations) {
            for (var j = 0; j < this.character_animations[i].length; j++) {
                if (this.character_animations[i].length > j+1) {
                    this.character_animations[i][j].onFinish = function() {
                        // `this` refers to the character_animations object,
                        // `self` refers to the engine object
                        for (var k in self.character_animations) {
                            if (self.character_animations[k].indexOf(this) > -1) {
                                var animation = self.character_animations[k];
                                var frame_index = self.character_animations[k].indexOf(this);
                                this.node.hide();
                                animation[frame_index+1].node.show();
                                this.reset();
                                animation[frame_index+1].play();
                            }
                        }
                    }
                } else {
                    this.character_animations[i][j].onFinish = function() {
                        for (var k in self.character_animations) {
                            if (self.character_animations[k].indexOf(this) > -1) {
                                var animation = self.character_animations[k];
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

        // Default character animations
        this.speak_animation = this.character_animations["speak"];
        this.idle_animation = this.character_animations["idle"];

        // Creating all image objects from json file based on their attributes
        var imageData = this.stage.toObject();

        for (var i = 0; i < imageData.children.length; i++) {
            for (var j = 0; j < imageData.children[i].children.length; j++) {
                if (imageData.children[i].children[j].className == 'Image') {
                    this.createObject(imageData.children[i].children[j].attrs);
                    var object_attrs = imageData.children[i].children[j].attrs;

                    if (object_attrs.animated === true) {
                        this.create_animation(this.getObject(object_attrs.id));
                    }
                }
            }
            if (imageData.children[i].attrs.category == 'menu') {
                this.create_menu_action(imageData.children[i]);
            }
        }

        // On window load we create image hit regions for our items on object layers
        window.onload = () => { this.init_hit_regions() };

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
                for (var i = 0; i < this.current_layer.children.length; i++) {
                    var object = (this.current_layer.getChildren())[i];

                    if (object != undefined && object.getAttr('category') != 'room_background') {
                        // Break if still intersecting with the same target
                        if (this.target != null && this.checkIntersection(this.dragged_item, this.target)) {
                            break;
                        } else if (this.checkIntersection(this.dragged_item, object)) {
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
                    for (var i = 0; i < this.inventory_layer.children.length; i++) {
                        var object = (this.inventory_layer.getChildren())[i];
                        if (object != undefined) {
                            // Look for intersecting targets
                            if (this.checkIntersection(this.dragged_item, object)) {
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
                    var leftArrow = this.getObject("inventory_left_arrow");
                    var rightArrow = this.getObject("inventory_right_arrow");
                    if (!this.dragDelayEnabled) {
                        if (this.checkIntersection(this.dragged_item, leftArrow)) {
                            this.dragDelayEnabled = true;
                            this.inventory_index--;
                            this.redrawInventory();
                            setTimeout(() => this.dragDelayEnabled = false, this.dragDelay);
                        } else if (this.checkIntersection(this.dragged_item, rightArrow)) {
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
                    this.current_layer.getChildren().each((shape, i) => {
                        shape.shadowBlur(0);
                    });
                    this.inventory_layer.getChildren().each((shape, i) => {
                        shape.shadowBlur(0);
                    });
                    this.target.clearCache();
                    this.target.shadowColor('purple');
                    this.target.shadowOffset({x: 0, y: 0});
                    this.target.shadowBlur(20);
                    this.inventory_layer.draw();

                    // Don't cause a mass of errors if no text found
                    try {
                        this.interaction_text.text(this.texts_json[this.target.id()].name);
                    } catch (e) {
                        // Do nothing
                    }

                    this.interaction_text.x(this.dragged_item.x() + (this.dragged_item.width() / 2));
                    this.interaction_text.y(this.dragged_item.y() - 30);
                    this.interaction_text.offset({
                        x : this.interaction_text.width() / 2
                    });

                    this.text_layer.draw();
                } else {
                    // If no target, clear the texts and highlights
                    this.current_layer.getChildren().each((shape, i) => {
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
        this.stage.on('touchstart mousedown', (event) => {
            this.clearText(this.monologue);
            this.clearText(this.npc_monologue);
            this.stopCharacterAnimations();
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
            var dragged_item = event.target;

            // If nothing's under the dragged item
            if (this.target == null) {
                dragged_item.x(this.dragStartX);
                dragged_item.y(this.dragStartY);
            }
            // Look up the possible interaction from interactions.json.
            else if (this.target.getAttr('category') == 'furniture' || this.target.getAttr('category') == 'item') {
                var commands;

                // Not all dragged_items have an entry in interactions_json, or have
                // anything specified for target_item.
                try {
                    commands = this.interactions_json[dragged_item.id()][this.target.id()];
                } catch (e) {
                    // Do nothing
                }

                // no dragend interaction defined: usual text
                if (commands == null) {
                    commands = [{"command":"monologue", "textkey":{"object": dragged_item.id(), "string": this.target.id()}}];
                }

                this.handle_commands(commands);
            }

            // Check if dragged item's destroyed, if not, add it to inventory
            if (dragged_item.isVisible()) {
                this.inventoryAdd(dragged_item);
            }

            // Clearing the glow effects
            this.current_layer.getChildren().each((shape, i) => {
                shape.shadowBlur(0);
            });
            this.inventory_layer.getChildren().each((shape, i) => {
                shape.shadowBlur(0);
            });
            // Clearing the texts
            this.clearText(this.interaction_text);

            this.redrawInventory();
        });

        // Set start layer
        this.stage.getChildren().each((o) => {
            if (o.getAttr('category') === 'room' && o.getAttr('start') === true) {
                this.game_start_layer = o;
            }
        });

        // Not using getObject (with its error messaging), because these are optional.
        this.start_layer = this.stage.find("#start_layer")[0]; // TODO: get rid of start_layer

        // The optional start layer has optional splash screen and optional start menu.
        // TODO: Delay transition to game_start_layer?
        if (this.stage.find("#start_layer")[0] != null) {
            this.current_background = 'start_layer';
            this.current_layer = this.start_layer;
            if (this.stage.find('#splash_screen')[0] != null) {
                this.stage.find('#splash_screen')[0].on('tap click', (event) => {
                    this.stage.find('#splash_screen')[0].hide();
                    if (this.stage.find('#start_layer_menu')[0] != null) {
                        this.display_start_menu();
                    } else {
                        this.do_transition(this.game_start_layer.id());
                    }
                });
            } else { // no splash screen
                if (this.stage.find('#start_layer_menu')[0] != null) {
                    this.display_start_menu();
                } else {
                    // start layer without splash or menu?!
                    this.do_transition(this.game_start_layer.id());
                }
            }
        } else {
            // no start layer
            this.do_transition(this.game_start_layer.id());
        }
    }

    // Create image hit regions for our items on object layers
    // Loop backgrounds to create item hit regions and register mouseup event
    init_hit_regions() {
        this.stage.getChildren().each((o) => {
            if (o.getAttr('category') == 'room') {
                o.getChildren().each((shape, i) => {
                    if (shape.getAttr('category') != 'secret' && shape.className == 'Image') {
                        shape.cache();
                        shape.drawHitFromCache();
                    }
                });

                o.on('mouseup touchend', (event) => {
                    this.handle_click(event);
                });
            }
        });

        this.stage.draw();
        this.idle_animation[0].node.show();
        this.idle_animation[0].play();
    }


    create_animation(object) {
        var attrs = object.getAttr("animation");
        var animation = new Konva.Tween({
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

    /*
    Create item actions such as "new game" for the given menu object
    Menus may have certain kinds of actions: start_game, credits, main_menu
    Other actions (such as "none") are regarded as non-functioning menu buttons
    Object menu_image - the menu image object with the items inside
    */
    create_menu_action(menu_image) {
        var menu_object = this.menu_json[menu_image.attrs.id];
        if (!menu_object) {
            console.warn("Could not find menu.json entry for menu '", menu_image.attrs.id, "'");
            return;
        }

        // Go through the menu items to bind their actions
        for (var i = 0; i < menu_image.children.length; i++) {
            var item_id = menu_image.children[i].attrs.id;
            var item_action = menu_object.items[item_id];

            var item = this.getObject(item_id);
            // Don't override custom menu event listeners
            if (item.eventListeners.click) {
                continue;
            }

            if (item_action == "start_game") {
                item.on('tap click', (event) => {
                    if (this.getObject("intro") != "") {
                        var intro_delay = this.play_sequence("intro", true);
                        setTimeout(() => {
                            this.do_transition(this.game_start_layer.id(), 0)
                        }, intro_delay);
                    } else {
                        // Assume intro layer has a transition to game_start_layer
                        this.do_transition(this.game_start_layer.id());
                    }
                });
            } else if (item_action == "credits") {
                item.on('tap click', (event) => {
                    this.setMonologue(this.findMonologue(event.target.id()));
                });
            } else if (item_action == "main_menu") {
                // TODO: Return to main menu after end of game.
                item.on('tap click', (event) => {
                    this.getObject("end_texts").hide();
                    this.display_start_menu();
                });
            }
        }
    }

    // Display menu for the given layer
    // string layerId - the ID of the layer we want to display the menu for
    display_menu(layerId) {
        this.hide_menu();
        this.menu = this.menu_json[layerId] !== undefined ? this.getObject(this.menu_json[layerId]["menu"]) : false;
        if (!this.menu) {
            return;
        }

        this.menu.show()
        this.current_menu = this.menu;
    }

    hide_menu() {
        if (!this.current_menu) {
            return;
        }

        this.menu.hide();
        this.current_menu = null;
    }

    // Display the start menu including "click" to proceed image
    display_start_menu() {
        this.start_layer.show();
        this.display_menu("start_layer");
        this.character_layer.show();
        this.inventory_bar_layer.show();
        this.stage.draw();
        this.play_music('start_layer');
    }

    /*
    Play music
    string id - object ID from JSON with "music":"file name" attribute
    */
    play_music(id) {
        if (id == undefined) {
            return;
        }

        var data = this.music_json[id];

        // ID and music found from JSON?
        if (!data || !data.music) {
            if (this.current_music) {
                this.current_music.pause();
                this.current_music = null;
            }
            return;
        }

        // If not already playing music or old/new songs are different
        if (!this.current_music || this.current_music_source != data.music) {
            var old_music = null;
            if (this.current_music) {
                old_music = this.current_music
                this.current_music = new Audio(data.music);
                this.current_music.volume = 0;
            } else {
                this.current_music = new Audio(data.music);
                this.current_music.volume = 1;
                data.music_loop === false ? this.current_music.loop = false : this.current_music.loop = true;
            }

            this.current_music.play();

            // Fade music volume if set so
            if (data.music_fade === true) {
                this.current_music.faded = true;

                if (old_music) {
                    var fade_interval_2 = setInterval(() => {
                        // Audio API will throw exception when volume is maxed
                        try {
                            old_music.volume -= 0.05;
                        } catch (e) {
                            old_music.pause();
                            clearInterval(fade_interval_2);
                        }

                        try {
                            this.current_music.volume += 0.05;
                        } catch (e) {
                            old_music.volume = 1;
                        }
                    }, 200)
                } else if (this.current_music) {
                    var fade_interval = setInterval(() => {
                        // Audio API will throw exception when volume is maxed
                        try {
                            this.current_music.volume += 0.05
                        } catch (e) {
                            this.current_music.volume = 1;
                            clearInterval(fade_interval);
                        }
                    }, 200)
                }
            } else {
                this.current_music.faded = false;
                this.current_music.volume = 1;

                if (old_music) {
                    old_music.pause();
                }
            }
            this.current_music_source = data.music;
        }
    }

    stop_music() {
        if (this.current_music == null) {
            return;
        }

        // Fade music volume if set so
        if (this.current_music.faded === true) {
            var fade_interval = setInterval(() => {
                // Audio API will throw exception when volume is maxed
                // or an crossfade interval may still be running
                try {
                    this.current_music.volume -= 0.05
                    this.current_music.pause();
                } catch (e) {
                    clearInterval(fade_interval);
                }
            }, 100)
        } else {
            this.current_music.pause();
        }
    }

    /// Plays a sequence defined in sequences.json
    /// @param id The sequence id in sequences.json
    /// @param monologue boolean Show sequence's examine text at the end of sequence
    /// @return The length of sequence in ms. Doesn't include the fade-in!
    play_sequence(id, monologue) {
        var delay = 700;

        // Animation cycle for proper fading and drawing order
        this.fade_full.reset();
        this.fade_layer_full.show();
        this.fade_full.play();

        var old_layer = this.current_layer;
        this.current_layer = this.getObject(id);
        var sequence_exit_text = monologue === true ? this.findMonologue(this.current_layer.id()) : null;
        var sequence = this.sequences_json[this.current_layer.id()];
        var final_fade_duration = sequence.transition_length != null ? sequence.transition_length : 0;

        var sequenceCounter = 0;
        var slidesTotal = 0;
        var slide = null;

        this.play_music(id);

        for (var i in sequence.slides) {
            slidesTotal++;

            var lastSlide = slide;
            slide = this.getObject(sequence.slides[i].id);

            var displaySlide = (i, slide, lastSlide) => {
                setTimeout(() => {
                    this.current_layer.show();
                    old_layer.hide();
                    this.fade_layer_full.show();
                    this.hide_menu(); // So that the menu is hidden after first fadeout.
                    this.character_layer.hide();
                    this.inventory_bar_layer.hide();
                    this.inventory_layer.hide();
                    this.fade_full.play();

                    if (lastSlide) {
                        lastSlide.hide();
                    }
                    slide.show();

                    // Fade-in the slide
                    var slideFade = sequence.slides[i].do_fade;
                    if (slideFade === true) {
                        setTimeout(() => {
                            this.fade_full.reverse();
                            this.stage.draw();
                        }, 700);
                    } else {
                        // Immediately display the slide
                        this.fade_full.reset();
                        this.stage.draw();
                    }

                    sequenceCounter += 1;

                }, delay);
            }
            displaySlide(i, slide, lastSlide);

            delay = delay + sequence.slides[i].show_time;
        };

        // After last slide, do the final fade and set up exit monologue.
        if (final_fade_duration > 0) {
            setTimeout(() => {
                this.fade_full.tween.duration = final_fade_duration;
                this.fade_full.play();

                setTimeout(() => {
                    this.fade_full.reverse();
                    setTimeout(() => {
                        this.fade_layer_full.hide();
                        this.fade_full.tween.duration = 600; // reset to default
                        if (monologue === true) {
                            this.setMonologue(sequence_exit_text);
                        }
                    }, final_fade_duration);
                }, final_fade_duration);
            }, delay);

            // Doesn't include the fade-in!
            delay = delay + final_fade_duration;
        }

        // Return sequence delay
        return delay;
    }

    /// Transition to a room.
    /// @param room_id The id of the room to transition to.
    /// @param fade_time_param The fade duration; if null, use a default.
    /// @param comingFrom The room where the transition was started in. Sets up
    ///                   the monologue text.
    do_transition(room_id, fade_time_param, comingFrom) {
        var fade_time = fade_time_param;

        // By default do fast fade
        if (fade_time_param == null) {
            var fade_time = 700;
        }

        // Don't fade if duration is zero.
        if (fade_time != 0) {
            this.fade_room.tween.duration = fade_time;
            this.fade_layer_room.show();
            this.fade_room.play();
        }

        setTimeout(() => {
            this.stop_music();
            // Don't fade if duration is zero.
            if (fade_time != 0) {
                this.fade_room.reverse();
            }

            // may be null if no start_layer is defined
            if (this.current_layer != null) {
                this.current_layer.hide();
            }

            this.current_layer = this.getObject(room_id);

            // Play the animations of the room
            for (var i in this.animated_objects) {
                if (this.animated_objects[i].node.parent.id() == this.current_layer.id()) {
                    this.animated_objects[i].play();
                } else if (this.animated_objects[i].anim.isRunning()) {
                    this.animated_objects[i].anim.stop(); // Should this be .anim.stop() or .pause()?
                }
            }

            this.current_layer.show();
            this.inventory_layer.show();
            this.inventory_bar_layer.show();
            this.character_layer.show();
            this.stage.draw();

            setTimeout(() => {
                this.fade_layer_room.hide();
                this.play_music(this.current_layer.id());
                if (comingFrom) {
                    this.setMonologue(this.findMonologue(comingFrom));
                }
            }, fade_time);
        }, fade_time);
    }

    // Basic intersection check; checking whether corners of the dragged item are inside the area of the intersecting object
    checkIntersection(dragged_item, target) {
        // If target is visible and of suitable category
        if (target.isVisible()&& (target.getAttr('category') != undefined && target.getAttr('category') != 'secret')) {
            // If horizontally inside
            if (dragged_item.x() > target.x() && dragged_item.x() < (target.x() + target.width()) || (dragged_item.x() + dragged_item.width()) > target.x() && (dragged_item.x() + dragged_item.width()) < (target.x() + target.width())) {
                // If vertically inside
                if (dragged_item.y() > target.y() && dragged_item.y() < (target.y() + target.height()) || (dragged_item.y() + dragged_item.height()) > target.y() && (dragged_item.y() + dragged_item.height()) < (target.y() + target.height())) {
                    return true;
                }
            }
        }
        return false;
    }

    /// Handle click interactions on room objects, inventory items and inventory
    /// arrows.
    handle_click(event) {
        var target = event.target;
        var target_category = target.getAttr('category');

        if (target_category == 'furniture' || target_category == 'item') {
            var commands;

            // Not all clicked items have their entry in interactions_json.
            try {
                commands = this.interactions_json[target.id()].click;
            } catch (e) {
                // Do nothing
            }

            // no click interaction defined: usual examine
            if (commands == null) {
                commands = [{"command":"monologue", "textkey":{"object": target.id(), "string": "examine"}}];
            }

            this.handle_commands(commands);
        }
        // Pick up rewards
        else if (target_category == 'secret') {
            this.setMonologue(this.findMonologue(target.id(), 'pickup'));
            var rewardID = target.getAttr('reward');
            this.inventoryAdd(this.getObject(rewardID));
            this.rewards++;
            this.removeObject(target);

            // To prevent multiple events happening at the same time
            event.cancelBubble = true;
        }
        // Print examine texts for rewards
        else if (target_category == 'reward') {
            this.setMonologue(this.findMonologue(target.id()));
        }
        // Inventory arrow buttons
        else if (target.getAttr('id') == 'inventory_left_arrow') {
            if (target.getAttr('visible') == true) {
                this.inventory_index--;
                this.redrawInventory();
            }
        }
        else if (target.getAttr('id') == 'inventory_right_arrow') {
            if (target.getAttr('visible') == true) {
                this.inventory_index++;
                this.redrawInventory();
            }
        }
    }

    /// Loop through a list of interaction commands and execute them with
    /// handle_command, with timeout if specified.
    handle_commands(commands) {
        for (var i in commands) {
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
    /// Timeouts are done in handle_commands. Order of commands in interactinos.json
    /// can be important: for instance, monologue plays the speaking animation, so
    /// play_character_animation should come after it, so that the speaking
    /// animation is stopped and the defined animation plays, and not vice versa.
    handle_command(command) {
        if (command.command == "monologue") {
            this.setMonologue(this.findMonologue(command.textkey.object, command.textkey.string));
        } else if (command.command == "inventory_add") {
            this.inventoryAdd(this.getObject(command.item));
        } else if (command.command == "inventory_remove") {
            this.inventoryRemove(this.getObject(command.item));
        } else if (command.command == "remove_object") {
            this.removeObject(this.getObject(command.object));
        } else if (command.command == "add_object") {
            this.addObject(this.getObject(command.object));
        } else if (command.command == "play_ending") {
            this.play_ending(command.ending);
        } else if (command.command == "do_transition") {
            this.do_transition(command.destination, command.length != null ? command.length : 700);
        } else if (command.command == "play_character_animation") {
            // Overrides default speak animation from setMonologue.
            this.playCharacterAnimation(this.character_animations[command.animation], command.length);
        } else if (command.command == "play_sequence") {
            this.play_sequence(command.sequence, command.monologue);
        } else if (command.command == "set_idle_animation") {
            this.setIdleAnimation(command.animation_name);
        } else if (command.command == "set_speak_animation") {
            this.setSpeakAnimation(command.animation_name);
        } else if (command.command == "npc_monologue") {
            nthis.pcMonologue(
                this.getObject(command.npc),
                this.findMonologue(command.textkey.object, command.textkey.string)
            );
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
        var object = this.stage.find('#' + id)[0];
        if (object == null) {
            console.warn("Could not find object from stage with id " + id);
        }
        return object;
    }

    /// Add an object to the stage. Currently, this means setting its visibility
    /// to true. // TODO: Add animations & related parts.
    /// @param The object to be added.
    addObject(object) {
        object.clearCache();
        object.show();
        object.cache();
        this.current_layer.draw();
    }

    /// Remove an object from stage. Called after interactions that remove objects.
    /// The removed object is hidden. Handles animations.
    /// @param object The object to be destroyed.
    removeObject(object) {
        this.removeAnimation(object.id());
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

    // Play the hardcoded end sequence and show the correct end screen based on the number of rewards found
    play_ending(ending) {
        this.fade_full.reset();
        this.fade_layer_full.show();
        this.fade_full.play();

        setTimeout(() => {
            // Clear inventory except rewards
            for (var i = this.inventory_layer.children.length-1; i >= 0; i--) {
                var shape = this.inventory_layer.children[i];
                if (shape.getAttr('category') != 'reward') {
                    this.inventoryRemove(shape);
                }
                this.inventory_index = 0;
            }

            this.play_music(ending);
            var rewards_text = this.getObject("rewards_text");
            var old_text = rewards_text.text();
            rewards_text.text(this.rewards + rewards_text.text());

            this.current_layer.hide(); // hide the sequence layer
            this.current_layer = this.getObject(ending);
            this.current_layer.show();
            this.inventory_bar_layer.show();
            this.inventory_layer.show();
            this.display_menu(this.current_layer.id());
            this.character_layer.show();
            this.getObject("end_texts").show();
            this.stage.draw();
            rewards_text.text(old_text);

            this.fade_full.reverse();
            setTimeout(() => this.fade_layer_full.hide(), 700);
        }, 700);
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

    /// Find monologue text in object. If a text is not found from texts_json by
    /// the parameter, return the default text for the object (if it exists), or
    /// the master default text.
    /// @param object_id The id of the object which's texts are looked up.
    /// @param key The key to look up the text with. If null, set to 'examine' by
    ///            default. Otherwise usually the name of the other object in
    ///            item-object interactions.
    /// @return The text found, or the default text.
    findMonologue(object_id, key) {
        if (key == null) {
            key = 'examine';
        }

        var text = null;
        try { // Might not find with object_id
            text = this.texts_json[object_id][key];
        } catch(e) {
            // Do nothing
        }

        // If no text found, use default text
        if (!text || text.length == 0) {
            // Item's own default
            console.warn("No text " + key + " found for " + object_id);
            try { // Might not find with object_id
                text = this.texts_json[object_id]['default'];
            } catch(e) {
                // Do nothing
            }

            if (!text) {
                // Master default
                console.warn("Default text not found for " + object_id + ". Using master default.");
                try {
                    text = this.texts_json["default"]["examine"];
                } catch (e) {
                    text = "Fallback default examine entry missing from texts.json!"; // crude
                }
            }
        }

        return text;
    }

    /// Set NPC monologue text and position the NPC speech bubble to the desired
    /// NPC.
    /// @param npc The object in the stage that will have the speech bubble.
    /// @param text The text to be shown in the speech bubble.
    npcMonologue(npc, text) {
        this.npc_monologue.setWidth('auto');
        this.npc_speech_bubble.show();
        this.npc_monologue.text(text);

        var npc_tag = this.getObject("npc_tag");
        if (npc.x() + npc.width() > (this.stage.width()/2)) {
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

        this.npc_speech_bubble.y(npc.y() + (npc.height()/3));

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

        this.playCharacterAnimation(this.speak_animation, 3000);
    }

    /// Play a character animation
    /// @param animation The animation to play.
    /// @param timeout The time in ms until the character returns to idle animation.
    playCharacterAnimation(animation, timeout) {
        this.stopCharacterAnimations();
        for (var i in this.idle_animation) {
            this.idle_animation[i].node.hide();
            this.idle_animation[i].reset();
        }
        animation[0].node.show();
        animation[0].play();

        this.character_layer.draw();

        clearTimeout(this.character_animation_timeout);
        this.character_animation_timeout = setTimeout(() => {
            this.stopCharacterAnimations();
        }, timeout);
    }

    ///Stop the characer animations, start idle animation
    stopCharacterAnimations() {
        for (var i in this.character_animations) {
            for (var j in this.character_animations[i]) {
                this.character_animations[i][j].node.hide();
                this.character_animations[i][j].reset();
            }
        }

        this.idle_animation[0].node.show();
        this.idle_animation[0].play();
        this.character_layer.draw();
    }

    /// Change idle animation, so that the character graphics can be changed
    /// mid-game.
    /// @param animation_name The name of the animation, look the animation up
    ///                       from this.character_animations[].
    setIdleAnimation(animation_name) {
        this.idle_animation = this.character_animations[animation_name];
        this.stopCharacterAnimations(); // reset and play the new idle animation
    }

    /// Change speak animation, so that the character graphics can be changed
    /// mid-game.
    /// @param animation_name The name of the animation, look the animation up
    ///                       from this.character_animations[].
    setSpeakAnimation(animation_name) {
        this.speak_animation = this.character_animations[animation_name];
        this.stopCharacterAnimations(); // reset and play idle animation
    }

    // Load json from the server
    getJSON(json_file) {
        return this.jsonGetter.getJSON(json_file);
    }

    // Setting an image to the stage and scaling it based on relative values if they exist
    createObject(o) {
        window[o.id] = new Image();
        window[o.id].onLoad = (() => {
            this.getObject(o.id).image(window[o.id]);
        })();
        window[o.id].src = o.src;
    }

    /// Adding an item to the inventory. Adds new items, but also an item that
    /// has been dragged out of the inventory is put back with this function.
    /// XXX: May become problematic if interaction both returns the dragged item
    /// and adds a new one.
    /// @param item Item to be added to the inventory
    inventoryAdd(item) {
        item.show();
        item.moveTo(this.inventory_layer);
        item.clearCache();
        item.size({width: 80, height: 80});

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

        this.current_layer.draw();
        this.redrawInventory();
    }

    /// Removing an item from the inventory. Dragged items are currently just
    /// hidden & inventory is readrawn only after drag ends.
    /// @param item Item to be removed from the inventory
    inventoryRemove(item) {
        item.hide();
        item.moveTo(this.current_layer);
        item.draggable(false);
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
        this.stopCharacterAnimations();
    }

    /// Redrawing inventory. Shows the items that should be visible according to
    /// inventory_index and takes care of showing inventory arrows as necessary.
    redrawInventory() {
        this.inventory_layer.getChildren().each((shape, i) => {
            shape.setAttr('visible', false);
            shape.draggable(false);
        });

        // If the left arrow is visible AND there's empty space to the right,
        // scroll the inventory to the left. This should happen when removing items.
        if (this.inventory_index + this.inventory_max > this.inventory_list.length) {
            this.inventory_index = Math.max(this.inventory_list.length - this.inventory_max, 0);
        }

        for (var i = this.inventory_index; i < Math.min(this.inventory_index + this.inventory_max, this.inventory_list.length); i++) {
            var shape = this.inventory_list[i];
            shape.draggable(true);
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
