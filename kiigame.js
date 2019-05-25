//Get jsons from the server
var images_json_text = getJSON('images.json');
var objects_json = JSON.parse(getJSON('objects.json'));
var texts_json = JSON.parse(getJSON('texts.json'));
var interactions_json = JSON.parse(getJSON('interactions.json'));
var character_animations_json = JSON.parse(getJSON('character_animations.json'));
var sequences_json = JSON.parse(getJSON('sequences.json'));
var music_json = JSON.parse(getJSON('music.json'));

//Create stage and everything in it from json
var stage = Konva.Node.create(images_json_text, 'container');

//Scale stage to window size
//stage.setWidth(window.innerWidth);
//stage.setHeight(window.innerHeight);

//Define variables from stage for easier use"

//Texts & layers
var monologue = getObject("monologue");
var character_speech_bubble = getObject("character_speech_bubble");
var npc_monologue = getObject("npc_monologue");
var npc_speech_bubble = getObject("npc_speech_bubble");
var interaction_text = getObject("interaction_text");

var inventory_layer = getObject("inventory_layer");
var inventory_bar_layer = getObject("inventory_bar_layer");
var character_layer = getObject("character_layer");
var text_layer = getObject("text_layer");
var fade_layer_full = getObject("fade_layer_full");
var fade_layer_room = getObject("fade_layer_room");

//Scale background and UI elements
getObject("black_screen_full").size({width: stage.width(), height: stage.height()});
getObject("black_screen_room").size({width: stage.width(), height: stage.height() - 100});
getObject("inventory_bar").y(stage.height() - 100);
getObject("inventory_bar").width(stage.width());
//window.addEventListener("orientationchange", function() {console.log(window.orientation)}, false);

//Make a json object from the json string
var images_json = stage.toObject();

//The amount of rewards found
var rewards = 0;

//List of items in the inventory. inventory_list.length gives the item amount.
var inventory_list = [];
//Offset from left for drawing inventory items starting from proper position
var offsetFromLeft = 50;
//How many items the inventory can show at a time (7 with current settings)
var inventory_max = 7;
//The item number where the shown items start from
//(how many items from the beginning are not shown)
var inventory_index = 0;

//Timeout event for showing character animation for certain duration
var character_animation_timeout;

//Temporary location for inventory items if they need to be moved back to the location because of invalid interaction
var x;
var y;

//For limiting the amount of intersection checks
var delayEnabled = false;

//For limiting the speed of inventory browsing when dragging an item
var dragDelay = 500;
var dragDelayEnabled = false;

//Music
//Different browsers and different browser versions support different formats. MP3 should work with in all the major
//browsers in current versions.
var current_music;
var current_music_source;

// Track the currently shown menu
var current_menu;

//The item dragged from the inventory
var dragged_item;

//Intersection target (object below dragged item)
var target;

//Animation for fading the screen
var fade_full = new Konva.Tween({
	node : fade_layer_full,
	duration : 0.6,
	opacity : 1
});

//Animation for fading the room portion of the screen
var fade_room = new Konva.Tween({
	node : fade_layer_room,
	duration : 0.6,
	opacity : 1
});

//List of animated objects
var animated_objects = [];

// Create character animations.
var character_animations = [];

// Load up frames from json to the character animations array.
for (var i in character_animations_json) {
    var frames = [];
    for (var j in character_animations_json[i].frames) {
        var frame = new Konva.Tween({
            node: getObject(character_animations_json[i].frames[j].node),
            duration: character_animations_json[i].frames[j].duration
        });
        frames.push(frame);
    }
    character_animations[character_animations_json[i].id] = frames;
}

// Set up onFinish functions for each frame to show the next frame. In the case
// of the last of the frames, show the first frame.
for (var i in character_animations) {
    for (var j = 0; j < character_animations[i].length; j++) {
        if (character_animations[i].length > j+1) {
            character_animations[i][j].onFinish = function() {
                var animation = null;
                var frame_index = null;
                for (var k in character_animations) {
                    if (character_animations[k].indexOf(this) > -1) {
                        animation = character_animations[k];
                        frame_index = character_animations[k].indexOf(this);
                    }
                }
                this.node.hide();
                animation[frame_index+1].node.show();
                this.reset();
                animation[frame_index+1].play();
            }
        } else {
            character_animations[i][j].onFinish = function() {
                var animation = null;
                for (var k in character_animations) {
                    if (character_animations[k].indexOf(this) > -1)
                        animation = character_animations[k];
                }
                this.node.hide();
                animation[0].node.show();
                this.reset();
                animation[0].play();
            }
        }
    }
}

// Default character animations
var speak_animation = character_animations["speak"];
var idle_animation = character_animations["idle"];

//Creating all image objects from json file based on their attributes
for (var i = 0; i < images_json.children.length; i++) {
	for (var j = 0; j < images_json.children[i].children.length; j++) {
		if (images_json.children[i].children[j].className == 'Image') {
			createObject(images_json.children[i].children[j].attrs);
			object_attrs =images_json.children[i].children[j].attrs;

			if (object_attrs.animated === true)
				create_animation(getObject(object_attrs.id));
		}
	}
	if (images_json.children[i].attrs.category == 'menu')
		create_menu_action(images_json.children[i]);
}

//Variable for saving the current room (for changing backgrounds and object layers)
var current_layer;
var current_background;
var game_start_layer;

stage.getChildren().each(function(o) {
    if (o.getAttr('category') === 'room' && o.getAttr('start') === true)
	    game_start_layer = o;
});

// Not using getObject (with its error messaging), because these are optional.
var start_layer = stage.get("#start_layer")[0]; // TODO: get rid of start_layer

// The optional start layer has optional splash screen and optional start menu.
// TODO: Delay transition to game_start_layer?
if (stage.get("#start_layer")[0] != null) {
    current_background = 'start_layer';
    current_layer = start_layer;
    if (stage.get('#splash_screen')[0] != null) {
        stage.get('#splash_screen')[0].on('tap click', function(event) {
            stage.get('#splash_screen')[0].hide();
            if (stage.get('#start_layer_menu')[0] != null)
                display_start_menu();
            else
                do_transition(game_start_layer.id());
        });
    } else { // no splash screen
        if (stage.get('#start_layer_menu')[0] != null)
            display_start_menu();
        else // start layer without splash or menu?!
            do_transition(game_start_layer.id());
    }
} else { // no start layer
    do_transition(game_start_layer.id());
}

function create_animation (object) {
	var attrs = object.getAttr("animation");
	var animation = new Konva.Tween({
		node: object,
		x: attrs.x ? object.x() + attrs.x : object.x(),
		y: attrs.y ? object.y() + attrs.y : object.y(),
		width: attrs.width ? object.width() - 15 : object.width(),
		easing: Konva.Easings.EaseInOut,
		duration: attrs.duration,

		onFinish: function() {
			animation.reverse();
			setTimeout(function() {
				animation.play();
			}, attrs.duration * 1000);
		}
	});

	animated_objects.push(animation);
}

/*
Create item actions such as "new game" for the given menu object
Menus may have certain kinds of actions: start_game, credits, main_menu
Other actions (such as "none") are regarded as non-functioning menu buttons
Object menu_image - the menu image object with the items inside
*/
function create_menu_action(menu_image) {
	var menu_object = objects_json[menu_image.attrs.id];
	if (!menu_object) {
		console.warn("Could not find objects.json entry for menu '", menu_image.attrs.id, "'");
		return;
	}
	
	// Go through the menu items to bind their actions
	for (var i = 0; i < menu_image.children.length; i++) {
		var item_id = menu_image.children[i].attrs.id;
		var item_action = menu_object.items[item_id];
		
		var item = getObject(item_id);
		// Don't override custom menu event listeners
		if (item.eventListeners.click) {
			continue; }
			
		if (item_action == "start_game") {
			item.on('tap click', function(event) {
                if (getObject("intro") != "")
                {
                    var intro_delay = play_sequence("intro", true);
                    setTimeout('do_transition(game_start_layer.id(), 0)', intro_delay);
                }
                else // Assume intro layer has a transition to game_start_layer
                    do_transition(game_start_layer.id());
			});
		}
		else if (item_action == "credits") {
			item.on('tap click', function(event) {
				setMonologue(findMonologue(event.target.id()));
			});
		}
        // TODO: Return to main menu after end of game.
		else if (item_action == "main_menu") {
			item.on('tap click', function(event) {
				getObject("end_texts").hide();
				display_start_menu();
			});
		}
	}
}

// Display menu for the given layer
// string layerId - the ID of the layer we want to display the menu for
function display_menu(layerId) {
	hide_menu();
	menu = getObject(objects_json[layerId]["menu"]);
	if (!menu) {
		return;
	}

	menu.show()
	current_menu = menu;
}

function hide_menu() {
	if (!current_menu)
		return;
		
	menu.hide();
	current_menu = null;
}

//On window load we create image hit regions for our items on object layers
//Loop backgrounds to create item hit regions and register mouseup event
window.onload = function() {
	stage.getChildren().each(function(o) {
		if (o.getAttr('category') == 'room') {
			o.getChildren().each(function(shape, i) {
				if (shape.getAttr('category') != 'secret' && shape.className == 'Image') {
                    shape.cache();
					shape.drawHitFromCache();
				}
			});

			o.on('mouseup touchend', function(event) {
				handle_click(event);
			});
		}
	});

	stage.draw();
    idle_animation[0].node.show();
	idle_animation[0].play();
};

// Display the start menu including "click" to proceed image
function display_start_menu() {
	start_layer.show();
	display_menu("start_layer");
	character_layer.show();
	inventory_bar_layer.show();
	stage.draw();
	play_music('start_layer');
}

/*
Play music
string id - object ID from JSON with "music":"file name" attribute
 */
function play_music(id) {
	if (id == undefined) {
		return;
	}

	var data = music_json[id];

	// ID and music found from JSON?
	if (!data || !data.music) {
		if (current_music) {
			current_music.pause();
			current_music = null;
		}
		return;
	}

	// If not already playing music or old/new songs are different
	if (!current_music || current_music_source != data.music) {
		var old_music = null;
		if (current_music){
		//	current_music.pause();
			old_music = current_music
			current_music = new Audio(data.music);
			current_music.volume = 0;
			//console.log("music", current_music, current_music.volume);
			//data.music_loop === false ? old_music.loop = false : old_music.loop = true;
		} else {
			current_music = new Audio(data.music);
			current_music.volume = 1;
			//console.log("music", current_music, current_music.volume);
			data.music_loop === false ? current_music.loop = false : current_music.loop = true;
		}

		//current_music = new Audio(data.music);
		//current_music.volume = 0;
		//console.log("music", current_music, current_music.volume);
		//data.music_loop === false ? current_music.loop = false : current_music.loop = true;

		current_music.play();
		
		// Fade music volume if set so
		if (data.music_fade === true) {
		    current_music.faded = true;
            //volume = current_music.volume
			
			if (old_music){
				fade_interval_2 = setInterval(function() {
                	//console.log("volume2", old_music.volume)
                
              	  // Audio API will throw exception when volume is maxed
                	try {
                    	old_music.volume -= 0.05;
                	}
                	catch (e) {
						old_music.pause();
						clearInterval(fade_interval_2);
                	}
					
					try {
						current_music.volume += 0.05;
                	}
                	catch (e) {
						old_music.volume = 1;
                	}
            	}, 200)
			} else if (current_music) {
            	fade_interval = setInterval(function() {
                	//console.log("volume", current_music.volume)
                	// Audio API will throw exception when volume is maxed
                	try {
                    	current_music.volume += 0.05
                	}
                	catch (e) {
                    	current_music.volume = 1;
                    	clearInterval(fade_interval);
                	}
            	}, 200)
			}
        }
        else {
            current_music.faded = false;
            current_music.volume = 1;
			
			if (old_music)
				old_music.pause();
        }
		current_music_source = data.music;
	}
}

function stop_music() {
    //console.log("faded?",current_music.faded);
	if (current_music == null)
	    return;
	    
    // Fade music volume if set so
    if (current_music.faded === true) {
        fade_interval = setInterval(function() {
            //console.log("volume", current_music.volume)
            // Audio API will throw exception when volume is maxed
            // or an crossfade interval may still be running
            try {
                current_music.volume -= 0.05
                current_music.pause();
            }
            catch (e) {
                clearInterval(fade_interval);
            }
        }, 100)
    }
    else
        current_music.pause();
}

/// Plays a sequence defined in sequences.json
/// @param sequence The sequence id in sequences.json
/// @param monologue boolean Show sequence's examine text at the end of sequence
/// @return The length of sequence in ms. Doesn't include the fade-in!
function play_sequence(sequence, monologue) {
	var delay = 700;

	// Animation cycle for proper fading and drawing order
	fade_full.reset();
	fade_layer_full.show();
	fade_full.play();

	var old_layer = current_layer;
	current_layer = getObject(sequence);
    var sequence_exit_text = monologue === true ? findMonologue(current_layer.id()) : null;
	var object = sequences_json[current_layer.id()];
    var final_fade_duration = object.transition_length != null ? object.transition_length : 0;

	var sequence_counter = 0;
	var images_total = 0;
	var image = null;
	
	play_music(sequence);
	
	for (var i in object.images) {
		images_total++;
		
		var last_image = image;
		image = getObject(object.images[i].id);
		
		(function(i, image, last_image) {
			setTimeout(function() {
                current_layer.show();
				old_layer.hide();
				fade_layer_full.show();
				hide_menu(); // So that the menu is hidden after first fadeout.
                character_layer.hide();
                inventory_bar_layer.hide();
                inventory_layer.hide();
				fade_full.play();

				if (last_image)
					last_image.hide();
				image.show();

				// Fade-in the image
				var image_fade = object.images[i].do_fade;
				if (image_fade === true) {
					setTimeout(function() {
						fade_full.reverse();
						stage.draw();
					}, 700);
				}
				// Immediately display the image
				else {
					fade_full.reset();
					stage.draw();
				}

				sequence_counter += 1;

			}, delay);
		})(i, image, last_image);

		delay = delay + object.images[i].show_time;
	};

    // After last image, do the final fade and set up exit monologue.
    if (final_fade_duration > 0) {
        setTimeout(function() {
            fade_full.tween.duration = final_fade_duration;
            fade_full.play();

            setTimeout(function() {
                fade_full.reverse();
                setTimeout(function() {
                    fade_layer_full.hide();
                    fade_full.tween.duration = 600; // reset to default
                    if (monologue === true)
                        setMonologue(sequence_exit_text);
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
function do_transition(room_id, fade_time_param, comingFrom) {
	var fade_time = fade_time_param;

	// By default do fast fade
	if (fade_time_param == null)
		var fade_time = 700;

    // Don't fade if duration is zero.
    if (fade_time != 0)
    {
        fade_room.tween.duration = fade_time;
        fade_layer_room.show();
        fade_room.play();
    }

	setTimeout(function() {
		stop_music();
		if (fade_time != 0) // Don't fade if duration is zero.
            fade_room.reverse();

        if (current_layer != null) // may be null if no start_layer is defined
            current_layer.hide();

		current_layer = getObject(room_id);
		
		//Play the animations of the room
		for (var i in animated_objects) {
			if (animated_objects[i].node.parent.id() == current_layer.id())
				animated_objects[i].play();
			else if (animated_objects[i].anim.isRunning())
				animated_objects[i].anim.stop();	//Should this be .anim.stop() or .pause()?
		}
		
		current_layer.show();
		inventory_layer.show();
		inventory_bar_layer.show();
		character_layer.show();
		stage.draw();
		
		setTimeout(function() {
			fade_layer_room.hide();
			play_music(current_layer.id());
			if (comingFrom)
				setMonologue(findMonologue(comingFrom));
		}, fade_time);
	}, fade_time);
}

//Mouse up and touch end events (picking up items from the environment
//Mouse click and tap events (examine items in the inventory)
inventory_layer.on('click tap', function(event) {
	handle_click(event);
});
//Drag start events
stage.get('Image').on('dragstart', function(event) {
	dragged_item = event.target;
	inventoryDrag(dragged_item);
});

//While dragging events (use item on item or object)
stage.on('dragmove', function(event) {
	dragged_item = event.target;

	if (!delayEnabled) {
		// Setting a small delay to not spam intersection check on every moved pixel
		setDelay(10);

		// Loop through all the items on the current object layer
		for (var i = 0; i < current_layer.children.length; i++) {
			var object = (current_layer.getChildren())[i];
			
			if (object != undefined && object.getAttr('category') != 'room_background') {
				// Break if still intersecting with the same target
				if (target != null && checkIntersection(dragged_item, target)) {
					break;
				}
				// If not, check for a new target
				else if (checkIntersection(dragged_item, object)) {
					if (target != object) {
						target = object;
					}
					break;
                // No target, move on
				} else {
					target = null;
				}
			}
		}
		
		// If no intersecting targets were found on object layer, check the inventory
		if (target == null) {
			// Loop through all the items on the inventory layer
			for (var i = 0; i < inventory_layer.children.length; i++) {
				var object = (inventory_layer.getChildren())[i];
				if (object != undefined) {
					// Look for intersecting targets
					if (checkIntersection(dragged_item, object)) {
						if (target != object) {
							target = object;
						}
						break;
					} else {
						target = null;
					}
				}
			}
		}

		// Next, check the inventory_bar_layer, if the item is dragged over the inventory arrows
		if (target == null) {
			var leftArrow = getObject("inventory_left_arrow");
			var rightArrow = getObject("inventory_right_arrow");
			if (!dragDelayEnabled) {
				if (checkIntersection(dragged_item, leftArrow)) {
					dragDelayEnabled = true;
					inventory_index--;
					redrawInventory();
					setTimeout('dragDelayEnabled = false;', dragDelay);
				} else if (checkIntersection(dragged_item, rightArrow)) {
					dragDelayEnabled = true;
					inventory_index++;
					redrawInventory();
					setTimeout('dragDelayEnabled = false;', dragDelay);
				} else {
					target = null;
				}
			}
			clearText(interaction_text);
		}
		
		// If target is found, highlight it and show the interaction text
		if (target != null) {
			current_layer.getChildren().each(function(shape, i) {
				shape.shadowBlur(0);
			});
			inventory_layer.getChildren().each(function(shape, i) {
				shape.shadowBlur(0);
			});
            target.clearCache();
			target.shadowColor('purple');
			target.shadowOffset(0);
			target.shadowBlur(20);
			inventory_layer.draw();
			
			// Don't cause a mass of errors if no text found
			try {
				interaction_text.text(texts_json[target.id()].name);
			} catch (e) {
				// Do nothing
			}

			interaction_text.x(dragged_item.x() + (dragged_item.width() / 2));
			interaction_text.y(dragged_item.y() - 30);
			interaction_text.offset({
				x : interaction_text.width() / 2
			});

			text_layer.draw();
		} else {
			// If no target, clear the texts and highlights
			current_layer.getChildren().each(function(shape, i) {
				shape.shadowBlur(0);
			});
			inventory_layer.getChildren().each(function(shape, i) {
				shape.shadowBlur(0);
			});
			clearText(interaction_text);
		}
		
		current_layer.draw();
	}
});

//Basic intersection check; checking whether corners of the dragged item are inside the area of the intersecting object
function checkIntersection(dragged_item, target) {
	// If target is visible and of suitable category
	if (target.isVisible() && (target.getAttr('category') != undefined && target.getAttr('category') != 'secret')) {
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

/// Stop character animations and clear monologue when clicked or touched
/// anywhere on the screen.
stage.on('touchstart mousedown', function(event) {
	clearText(monologue);
    clearText(npc_monologue);
	stopCharacterAnimations();
});

/// Touch start and mouse down events (save the coordinates before dragging)
inventory_layer.on('touchstart mousedown', function(event) {
	x = event.target.x();
	y = event.target.y();
	//clearText(monologue);
});

/// Inventory arrow clicking events
inventory_bar_layer.on('click tap', function(event) {
	handle_click(event);
});

/// Drag end events for inventory items.
stage.get('Image').on('dragend', function(event) {
	var dragged_item = event.target;

	// If nothing's under the dragged item
	if (target == null) {
		dragged_item.x(x);
		dragged_item.y(y);
	}
    // Look up the possible interaction from interactions.json.
    else if (target.getAttr('category') == 'furniture' || target.getAttr('category') == 'item') {
        var commands;

        // Not all dragged_items have an entry in interactions_json, or have
        // anything specified for target_item.
        try {
            commands = interactions_json[dragged_item.id()][target.id()];
        } catch (e) {}

        if (commands == null) // no dragend interaction defined: usual text
             commands = [{"command":"monologue", "textkey":{"object": dragged_item.id(), "string": target.id()}}];

        handle_commands(commands);
    }

	// Check if dragged item's destroyed, if not, add it to inventory
	if (dragged_item.isVisible())
		inventoryAdd(dragged_item);

	// Clearing the glow effects
	current_layer.getChildren().each(function(shape, i) {
		shape.shadowBlur(0);
	});
	inventory_layer.getChildren().each(function(shape, i) {
		shape.shadowBlur(0);
	});
	// Clearing the texts
	clearText(interaction_text);

	redrawInventory();
});

/// Handle click interactions on room objects, inventory items and inventory
/// arrows.
function handle_click(event) {
	var target = event.target;
	var target_category = target.getAttr('category');

    if (target_category == 'furniture' || target_category == 'item') {
        var commands;

        // Not all clicked items have their entry in interactions_json.
        try {
            commands = interactions_json[target.id()].click;
        } catch (e) {}

        if (commands == null) // no click interaction defined: usual examine
            commands = [{"command":"monologue", "textkey":{"object": target.id(), "string": "examine"}}];

        handle_commands(commands);
	}
    // Pick up rewards
    else if (target_category == 'secret') {
		setMonologue(findMonologue(target.id(), 'pickup'));
		var rewardID = target.getAttr('reward');
		inventoryAdd(getObject(rewardID));
		rewards++;
        removeObject(target);

		// To prevent multiple events happening at the same time
		event.cancelBubble = true;
	}
	// Print examine texts for rewards
	else if (target_category == 'reward') {
		setMonologue(findMonologue(target.id()));
	}
	// Inventory arrow buttons
	else if (target.getAttr('id') == 'inventory_left_arrow') {
		if (target.getAttr('visible') == true) {
			inventory_index--;
			redrawInventory();
		}
	}
	else if (target.getAttr('id') == 'inventory_right_arrow') {
		if (target.getAttr('visible') == true) {
			inventory_index++;
			redrawInventory();
		}
	}
}

/// Loop through a list of interaction commands and execute them with
/// handle_command, with timeout if specified.
function handle_commands(commands) {
    for (var i in commands) {
        if (commands[i].timeout != null) {
            (function(commands, i) {
                setTimeout(function() {
                    handle_command(commands[i]);
                }, commands[i].timeout);
            })(commands, i);
        } else {
            handle_command(commands[i]);
        }
    }
}

/// Handle each interaction. Check what command is coming in, and do the thing.
/// Timeouts are done in handle_commands. Order of commands in interactinos.json
/// can be important: for instance, monologue plays the speaking animation, so
/// play_character_animation should come after it, so that the speaking
/// animation is stopped and the defined animation plays, and not vice versa.
function handle_command(command) {
    if (command.command == "monologue")
        setMonologue(findMonologue(command.textkey.object, command.textkey.string));
    else if (command.command == "inventory_add")
        inventoryAdd(getObject(command.item));
    else if (command.command == "inventory_remove")
        inventoryRemove(getObject(command.item));
    else if (command.command == "remove_object")
        removeObject(getObject(command.object));
    else if (command.command == "add_object")
        addObject(getObject(command.object));
    else if (command.command == "play_ending")
        play_ending(command.ending);
    else if (command.command == "do_transition")
        do_transition(command.destination, command.length != null ? command.length : 700);
    else if (command.command == "play_character_animation")
        playCharacterAnimation(character_animations[command.animation], command.length); // Overrides default speak animation from setMonologue.
    else if (command.command == "play_sequence")
        play_sequence(command.sequence, command.monologue);
    else if (command.command == "set_idle_animation")
        setIdleAnimation(command.animation_name);
    else if (command.command == "set_speak_animation")
        setSpeakAnimation(command.animation_name);
    else if (command.command == "npc_monologue")
        npcMonologue(getObject(command.npc), findMonologue(command.textkey.object, command.textkey.string));
    else
        console.warn("Unknown interaction command " + command.command);
}

/// Get an object from stage by it's id. Gives an error message in console with
/// the looked up name if it is not found. Basically, a wrapper for
/// stage.get(id) with error messaging, helpful with typos in jsons,
/// and also gives some errors if an object required by the kiigame.js script
/// itself is missing.
/// @param object The name of the object to look up.
/// @return Returns the object if it's found, or null if it isn't.
function getObject(id) {
    var object = stage.get('#' + id)[0];
    if (object == null)
        console.warn("Could not find object from stage with id " + id);
    return object;
}

/// Add an object to the stage. Currently, this means setting its visibility
/// to true. // TODO: Add animations & related parts.
/// @param The object to be added.
function addObject(object) {
    object.clearCache();
    object.show();
    object.cache();
    current_layer.draw();
}

/// Remove an object from stage. Called after interactions that remove objects.
/// The removed object is hidden. Handles animations.
/// @param object The object to be destroyed.
function removeObject(object) {
    removeAnimation(object.id());
    object.hide();
    current_layer.draw();
}

/// Remove an object from the list of animated objects.
/// @param id The id of the object to be de-animated.
function removeAnimation(id) {
    if (animated_objects.indexOf(id) > -1)
        animated_objects.splice(animated_objects.indexOf(id), 1);
}

//Play the hardcoded end sequence and show the correct end screen based on the number of rewards found
function play_ending(ending) {
    fade_full.reset();
    fade_layer_full.show();
    fade_full.play();

    setTimeout(function() {
        // Clear inventory except rewards
        for (var i = inventory_layer.children.length-1; i >= 0; i--) {
            var shape = inventory_layer.children[i];
            if (shape.getAttr('category') != 'reward')
                inventoryRemove(shape);
            inventory_index = 0;
        }

        play_music(ending);
        rewards_text = getObject("rewards_text");
        old_text = rewards_text.text();
        rewards_text.text(rewards + rewards_text.text());

        current_layer.hide(); // hide the sequence layer
        current_layer = getObject(ending);
        current_layer.show();
        inventory_bar_layer.show();
        inventory_layer.show();
        display_menu(current_layer.id());
        character_layer.show();
        getObject("end_texts").show();
        stage.draw();
        rewards_text.text(old_text);

        fade_full.reverse();
        setTimeout('fade_layer_full.hide();', 700);
    }, 700);
}

//Clearing the given text
function clearText(text) {
	text.text("");

	if (text.id() == 'monologue') {
		character_speech_bubble.hide();
	}
    else if (text.id() == 'npc_monologue') {
        npc_speech_bubble.hide();
    }

	text_layer.draw();
}

/// Find monologue text in object. If a text is not found from texts_json by
/// the parameter, return the default text for the object (if it exists), or
/// the master default text.
/// @param object_id The id of the object which's texts are looked up.
/// @param key The key to look up the text with. If null, set to 'examine' by
///            default. Otherwise usually the name of the other object in
///            item-object interactions.
/// @return The text found, or the default text.
function findMonologue(object_id, key) {
	if (key == null)
		key = 'examine';

    var text = null;
    try { // Might not find with object_id
        text = texts_json[object_id][key];
    } catch(e) {}

	// If no text found, use default text
	if (!text || text.length == 0) {
		// Item's own default
		console.warn("No text " + key + " found for " + object_id);
		try { // Might not find with object_id
            text = texts_json[object_id]['default'];
        } catch(e) {}
		if (!text) {
			// Master default
			console.warn("Default text not found for " + object_id + ". Using master default.");
			try {
                text = texts_json["default"]["examine"];
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
function npcMonologue(npc, text) {

    npc_monologue.setWidth('auto');
    npc_speech_bubble.show();
    npc_monologue.text(text);

    var npc_tag = getObject("npc_tag");
    if (npc.x() + npc.width() > (stage.width()/2)) {
        npc_tag.pointerDirection("right");
        if (npc_monologue.width() > npc.x() - 100) {
            npc_monologue.width(npc.x() - 100);
        }
        npc_monologue.text(text);
        npc_speech_bubble.x(npc.x());
    } else {
        npc_tag.pointerDirection("left");
        if (npc_monologue.width() > stage.width() - (npc.x() + npc.width() + 100)) {
            npc_monologue.width(stage.width() - (npc.x() + npc.width() + 100));
        }
        npc_monologue.text(text);
        npc_speech_bubble.x(npc.x() + npc.width());
    }

    npc_speech_bubble.y(npc.y() + (npc.height()/3));

    text_layer.draw();
}

/// Set monologue text.
/// @param text The text to be shown in the monologue bubble.
function setMonologue(text) {
	monologue.setWidth('auto');
	character_speech_bubble.show();
	monologue.text(text);
	if (monologue.width() > 524) {
		monologue.width(524);
		monologue.text(text);
	}

	character_speech_bubble.y(stage.height() - 100 - 15 - monologue.height() / 2);
	text_layer.draw();

    playCharacterAnimation(speak_animation, 3000);
}

/// Play a character animation
/// @param animation The animation to play.
/// @param timeout The time in ms until the character returns to idle animation.
function playCharacterAnimation(animation, timeout) {
    stopCharacterAnimations();
    for (var i in idle_animation) {
        idle_animation[i].node.hide();
        idle_animation[i].reset();
    }
	animation[0].node.show();
	animation[0].play();

	character_layer.draw();

	clearTimeout(character_animation_timeout);
	character_animation_timeout = setTimeout('stopCharacterAnimations();', timeout);
}

///Stop the characer animations, start idle animation
function stopCharacterAnimations() {
	for (var i in character_animations) {
        for (var j in character_animations[i]) {
            character_animations[i][j].node.hide();
            character_animations[i][j].reset();
        }
    }

    idle_animation[0].node.show();
    idle_animation[0].play();
	character_layer.draw();
}

/// Change idle animation, so that the character graphics can be changed
/// mid-game.
/// @param animation_name The name of the animation, look the animation up
///                       from character_animations[].
function setIdleAnimation(animation_name) {
    idle_animation = character_animations[animation_name];
    stopCharacterAnimations(); // reset and play the new idle animation
}

/// Change speak animation, so that the character graphics can be changed
/// mid-game.
/// @param animation_name The name of the animation, look the animation up
///                       from character_animations[].
function setSpeakAnimation(animation_name) {
    speak_animation = character_animations[animation_name];
    stopCharacterAnimations(); // reset and play idle animation
}

//Load json from the server
function getJSON(json_file) {
	var request = new XMLHttpRequest();
	request.open("GET", json_file, false);
	request.send(null);
	var json = request.responseText;
	return json;
}

//Setting an image to the stage and scaling it based on relative values if they exist
function createObject(o) {
	window[o.id] = new Image();
	window[o.id].onLoad = function() {
		getObject(o.id).image(window[o.id]);
	}();
	window[o.id].src = o.src;
}

/// Adding an item to the inventory. Adds new items, but also an item that
/// has been dragged out of the inventory is put back with this function.
/// XXX: May become problematic if interaction both returns the dragged item
/// and adds a new one.
/// @param item Item to be added to the inventory
function inventoryAdd(item) {
    item.show();
	item.moveTo(inventory_layer);
    item.clearCache();
	item.size({width: 80, height: 80});

	if (inventory_list.indexOf(item) > -1)
		inventory_list.splice(inventory_list.indexOf(item), 1, item);
	else
		inventory_list.push(item);

    // The picked up item should be visible in the inventory. Scroll inventory
    // to the right if necessary.
    if (inventory_list.indexOf(item) > inventory_index + inventory_max - 1)
        inventory_index = Math.max(inventory_list.indexOf(item) + 1 - inventory_max, 0);

    current_layer.draw();
	redrawInventory();
}

/// Removing an item from the inventory. Dragged items are currently just
/// hidden & inventory is readrawn only after drag ends.
/// @param item Item to be removed from the inventory
function inventoryRemove(item) {
	item.hide();
	item.moveTo(current_layer);
	item.draggable(false);
	inventory_list.splice(inventory_list.indexOf(item), 1);
	redrawInventory();
}

// Dragging an item from the inventory
function inventoryDrag(item) {
	item.moveTo(current_layer);
	inventory_bar_layer.draw();
    inventory_layer.draw();
    clearText(monologue);
    clearText(npc_monologue);
    stopCharacterAnimations();
}

/// Redrawing inventory. Shows the items that should be visible according to
/// inventory_index and takes care of showing inventory arrows as necessary.
function redrawInventory() {
	inventory_layer.getChildren().each(function(shape, i) {
		shape.setAttr('visible', false);
		shape.draggable(false);
	});

    // If the left arrow is visible AND there's empty space to the right,
    // scroll the inventory to the left. This should happen when removing items.
    if (inventory_index + inventory_max > inventory_list.length)
        inventory_index = Math.max(inventory_list.length - inventory_max, 0);

	for(var i = inventory_index; i < Math.min(inventory_index + inventory_max, inventory_list.length); i++) {
		shape = inventory_list[i];
		shape.draggable(true);
		shape.x(offsetFromLeft + (inventory_list.indexOf(shape) - inventory_index) * 100);
		shape.y(stage.height() - 90);
		shape.setAttr('visible', true);
	}

	if(inventory_index > 0) {
		getObject("inventory_left_arrow").show();
	} else {
		getObject("inventory_left_arrow").hide();
	}

	if(inventory_index + inventory_max < inventory_list.length) {
		getObject("inventory_right_arrow").show();
	} else {
		getObject("inventory_right_arrow").hide();
	}

	inventory_bar_layer.draw();
	inventory_layer.draw();
	current_layer.draw();
}

//Delay to be set after each intersection check
function setDelay(delay) {
	delayEnabled = true;
	setTimeout('delayEnabled = false;', delay);
}
