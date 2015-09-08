//KineticJS JavaScript Framework http://www.kineticjs.com/ Copyright 2013, Eric Rowell. Licensed under the MIT license.

//Get jsons from the server
var images_json_text = getJSON('images.json');
var objects_json = JSON.parse(getJSON('objects.json'));
var texts_json = JSON.parse(getJSON('texts.json'));

//Create stage and everything in it from json
var stage = Kinetic.Node.create(images_json_text, 'container');

// Add texts to objects in stage so that they can be dynamically changed,
// for example changing the jersey text in Lätkäzombit according to the
// player number chosen.
for (var key in texts_json)
{
    if (texts_json.hasOwnProperty(key))
    {
        var object = stage.get('#' + key)[0];
        if (object) // e.g. "default" in texts.json is not a proper object
        {
            for (var subkey in texts_json[key])
            {
                if (texts_json[key].hasOwnProperty(subkey))
                {
                    object.setAttr(subkey, texts_json[key][subkey]);
                }
            }
        }
    }
}

//Scale stage to window size
//stage.setWidth(window.innerWidth);
//stage.setHeight(window.innerHeight);

//Define variables from stage for easier use"

//Texts & layers
var monologue = stage.get('#monologue')[0];
var speech_bubble = stage.get('#speech_bubble')[0];
var interaction_text = stage.get('#interaction_text')[0];

var inventory_layer = stage.get('#inventory_layer')[0];
var inventory_bar_layer = stage.get("#inventory_bar_layer")[0];
var character_layer = stage.get('#character_layer')[0];
var text_layer = stage.get('#text_layer')[0];
var fade_layer = stage.get("#fade_layer")[0];

//Character frames
var speak_1 = stage.get('#character_speak_1')[0];
var speak_2 = stage.get('#character_speak_2')[0];
var idle_1 = stage.get('#character_idle_1')[0];
var idle_2 = stage.get('#character_idle_2')[0];
var panic = stage.get('#character_panic')[0];

//Scale background and UI elements
stage.get("#black_screen")[0].setSize(stage.getWidth(), stage.getHeight());
stage.get("#inventory_bar")[0].setY(stage.getHeight() - 100);
stage.get("#inventory_bar")[0].setWidth(stage.getWidth());
//window.addEventListener("orientationchange", function() {console.log(window.orientation)}, false);

//Make a json object from the json string
var images_json = stage.toObject();

//Variable for saving the current room (for changing backgrounds and object layers)
// TODO: Determine these other way
var start_layer = stage.get("#start_layer")[0];
var current_background = 'start_layer';
var game_start_layer;
var current_layer = start_layer;

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

//Timeout event for showing monologue animation for certain duration
var monologue_timeout;

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
var fade = new Kinetic.Tween({
	node : fade_layer,
	duration : 0.6,
	opacity : 1
});

//List of animated objects
var animated_objects = [];

/*
var wakeup = new Kinetic.Tween({
	node : fade_layer,
	duration : 3,
	opacity : 1
});
*/

//Speak animation
var speak_1_animation = new Kinetic.Tween({
	node : speak_1,
	duration : 0.3,
	onFinish : function() {
		speak_1.hide();
		speak_2.show();
		speak_1_animation.reset();
		speak_2_animation.play();
	}
});
var speak_2_animation = new Kinetic.Tween({
	node : speak_2,
	duration : 0.3,
	onFinish : function() {
		speak_1.show();
		speak_2.hide();
		speak_2_animation.reset();
		speak_1_animation.play();
	}
});
//Character's idle animation
var idle_1_animation = new Kinetic.Tween({
	node : idle_1,
	duration : 8.7,
	onFinish : function() {
		idle_1.hide();
		idle_2.show();
		idle_1_animation.reset();
		idle_2_animation.play();
	}
});
var idle_2_animation = new Kinetic.Tween({
	node : idle_2,
	duration : 0.2,
	onFinish : function() {
		idle_1.show();
		idle_2.hide();
		idle_2_animation.reset();
		idle_1_animation.play();
	}
});

function create_animation (object) {
	var attrs = object.getAttr("animation");
	var animation = new Kinetic.Tween({
		node: object,
		x: attrs.x ? object.getX() + attrs.x : object.getX(),
		y: attrs.y ? object.getY() + attrs.y : object.getY(),
		width: attrs.width ? object.getWidth() - 15 : object.getWidth(),
		easing: Kinetic.Easings.EaseInOut,
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

//Creating all image objects from json file based on their attributes
for (var i = 0; i < images_json.children.length; i++) {
	for (var j = 0; j < images_json.children[i].children.length; j++) {
		if (images_json.children[i].children[j].className == 'Image') {
			createObject(images_json.children[i].children[j].attrs);
			object_attrs =images_json.children[i].children[j].attrs;

			if (object_attrs.animated === true)
				create_animation(stage.get('#' + object_attrs.id)[0]);
		}
	}
	if (images_json.children[i].attrs.category == 'menu')
		create_menu_action(images_json.children[i]);
}

/*
Create item actions such as "new game" for the given menu object
Menus may have certain kinds of actions: start_game, credits, main_menu
Other actions (such as "none") are regarded as non-functioning menu buttons
Object menu_image - the menu image object with the items inside
*/
function create_menu_action(menu_image) {
	var menu_object = objects_json[menu_image.attrs.object_name];
	if (!menu_object) {
		console.warn("Could not find objects.json entry for menu '", menu_image.attrs.id, "'");
		return;
	}
	
	// Go through the menu items to bind their actions
	for (var i = 0; i < menu_image.children.length; i++) {
		var item_id = menu_image.children[i].attrs.id;
		var item_action = menu_object.items[item_id];
		
		var item = stage.get('#' + item_id)[0];
		// Don't override custom menu event listeners
		if (item.eventListeners.click) {
			continue; }
			
		if (item_action == "start_game") {
			item.on('tap click', function(event) {
                if (stage.get('#intro') != "")
                    play_sequence("intro");
                else // Assume intro layer has a transition to game_start_layer
                    do_transition(game_start_layer.getId());
			});
		}
		else if (item_action == "credits") {
			item.on('tap click', function(event) {
				event = event.targetNode;
				setMonologue(event.getAttr('id'));
			});
		}
		else if (item_action == "main_menu") {
			item.on('tap click', function(event) {
				stage.get('#end_texts')[0].hide();
				
				display_start_menu();
			});
		}
	}
}

// Display menu for the given layer
// string layerId - the ID of the layer we want to display the menu for
function display_menu(layerId) {
	hide_menu();
	menu = stage.get('#' + objects_json[layerId]["menu"])[0];
	if (!menu)
		return;
		
	menu.show()
	current_menu = menu;
	menu.moveToTop();
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
					shape.createImageHitRegion(function() {});
				}
			});

			o.on('mouseup touchend', function(event) {
				interact(event);
			});

			// Current layer for hit region purposes in different rooms
			if (o.getAttr('start') === true) {
				game_start_layer = o;
			}
		}
	});

	stage.draw();
	idle_1_animation.play();
};

stage.get('#beginning')[0].on('tap click', function(event) {
	stage.get('#beginning')[0].hide();
	display_start_menu();
});

// Display the start menu including "click" to proceed image
function display_start_menu() {
	start_layer.show();
	start_layer.moveToTop();
	
	display_menu("start_layer");
	character_layer.moveToTop();
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
	if (id == undefined)
		return;
	var data = objects_json[stage.get('#'+id)[0].getAttr('object_name')];

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

/*
Plays a sequence defined in JSON
string sequence - the sequence ID from JSON
boolean/string/null transition - Override sequence's transition target, false cancels transition, null does transition according to sequence
 */
function play_sequence(sequence, transition) {
	var delay = 700;
		
	// For some reason fade_layer size may change, fix it back here
	fade_layer.getChildren()[0].setWidth(1024);
	fade_layer.getChildren()[0].setHeight(643);
	
	// Animation cycle for proper fading and drawing order
	fade_layer.moveToTop();
	fade_layer.show();
	fade.reset();
	fade.play();
	
	var old_layer = current_layer;
	current_layer = stage.get("#"+sequence)[0];
	current_layer.moveToTop();
	var object = objects_json[current_layer.getAttr('object_name')];

	current_layer.show();

	var sequence_counter = 0;
	var images_total = 0;
	var image = null;
	
	play_music(sequence);
	
	for (var i in object.images) {
		images_total++;
		
		var last_image = image;
		image = stage.get('#' + object.images[i].id)[0];
		
		(function(i, image, last_image) {
			setTimeout(function() {
				old_layer.hide();
				fade_layer.show();
				text_layer.hide();
				fade.play();
				
				//if (sequence_counter == 0)
				//	play_music(sequence);
				
				if (last_image)
					last_image.hide();
				image.show();
				
				// Fade-in the image
				var image_fade = object.images[i].do_fade;
				if (image_fade === true) {
					setTimeout(function() {
						fade_layer.moveToTop();
						fade_layer.show();
						fade.reverse();
						stage.draw();
					}, 700);
				}
				// Immediately display the image
				else {
					fade.reset();
					stage.draw();
				}
				
				sequence_counter += 1;
				
				// Last image in the sequence
				if (images_total == sequence_counter) {
					setTimeout(function() {
						if (transition == null)
							do_transition(object.transition, true, current_layer.getId());
						else if (transition !== false)
							do_transition(transition, true);
						text_layer.show();
					}, 700)
				}

			}, delay);
		})(i, image, last_image);

		delay = delay + object.images[i].show_time;
	};
	
	// Return sequence delay
	return delay;
}

// Do a transition to a layer with specified ID
function do_transition(layerId, slow_fade, comingFrom) {
	hide_menu();
	
	// By default do fast fade
	var fade_time = 3000;
	if (slow_fade == null) {
		var fade_time = 700;
		character_layer.moveToTop();
	}
	fade.tween.duration = fade_time;
	
	fade_layer.show();
	fade.play();
	
	var textId = current_layer.getAttr('id');
	
	setTimeout(function() {
		stop_music();
		fade.reverse();
		
		current_layer.hide();
		current_layer = stage.get("#"+layerId)[0];
		
		//Play the animations of the room
		for (var i in animated_objects) {
			if (animated_objects[i].node.parent.getId() == current_layer.getId())
				animated_objects[i].play();
			else if (animated_objects[i].anim.isRunning())
				animated_objects[i].anim.stop();	//Should this be .anim.stop() or .pause()?
		}
		
		current_layer.show();
		
		inventory_bar_layer.show();
		character_layer.show();
		stage.draw();
		
		setTimeout(function() {
			fade_layer.hide();
			stage.get("#black_screen")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
			fade_layer.moveDown();
			play_music(current_layer.getId());
			if (comingFrom)
				setMonologue(comingFrom);
		}, fade_time);
	}, fade_time);
}

//Mouse up and touch end events (picking up items from the environment
//Start layer for the shortcut developer menu
start_layer.on('mouseup touchend', function(event) {
	interact(event);
});

//Mouse click and tap events (examine items in the inventory)
inventory_layer.on('click tap', function(event) {
	interact(event);
});
//Drag start events
stage.get('Image').on('dragstart', function(event) {
	dragged_item = event.targetNode;
	inventoryDrag(dragged_item);
});
//While dragging events (use item on item or object)
stage.on('dragmove', function(event) {
	dragged_item = event.targetNode;

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
			var leftArrow = stage.get("#inventory_left_arrow")[0];
			var rightArrow = stage.get("#inventory_right_arrow")[0];
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
				shape.setShadowBlur(0);
			});
			inventory_layer.getChildren().each(function(shape, i) {
				shape.setShadowBlur(0);
			});
			target.setShadowColor('purple');
			target.setShadowOffset(0);
			target.setShadowBlur(20);
			
			// Don't cause a mass of errors if no text found
			try {
				interaction_text.setText(texts_json[target.getAttr('id')].name);
			}
			catch (e) {
			}
			interaction_text.setX(dragged_item.getX() + (dragged_item.getWidth() / 2));
			interaction_text.setY(dragged_item.getY() - 30);
			interaction_text.setOffset({
				x : interaction_text.getWidth() / 2
			});

			dragged_item.moveToTop();
			text_layer.draw();

			// If no target, clear the texts and highlights
		} else {
			current_layer.getChildren().each(function(shape, i) {
				shape.setShadowBlur(0);
			});
			inventory_layer.getChildren().each(function(shape, i) {
				shape.setShadowBlur(0);
			});
			clearText(interaction_text);
		}
		
		current_layer.draw();
	}
});
//Basic intersection check; checking whether corners of the dragged item are inside the area of the intersecting object
function checkIntersection(dragged_item, target) {
	// If target is visible and of suitable category
	if (target.isVisible() && (target.getAttr('category') != undefined && target.getAttr('category') != 'secret' && target.getAttr('category') != 'transition')) {
		// If horizontally inside
		if (dragged_item.getX() > target.getX() && dragged_item.getX() < (target.getX() + target.getWidth()) || (dragged_item.getX() + dragged_item.getWidth()) > target.getX() && (dragged_item.getX() + dragged_item.getWidth()) < (target.getX() + target.getWidth())) {
			// If vertically inside
			if (dragged_item.getY() > target.getY() && dragged_item.getY() < (target.getY() + target.getHeight()) || (dragged_item.getY() + dragged_item.getHeight()) > target.getY() && (dragged_item.getY() + dragged_item.getHeight()) < (target.getY() + target.getHeight())) {
				return true;
			}
		}
	}
	return false;
}

//Drag end events
stage.get('Image').on('dragend', function(event) {
	var dragged_item = event.targetNode;
	var say_text = undefined;
	try {
		var object = objects_json[dragged_item.getId()];
	} catch(e) {
		var object = null;
	}
	// Variable for whether the dragged item is destroyed or not
	var destroy = false;

	if (target != null)
		say_text = texts_json[dragged_item.getId()][target.getId()];
	//console.log(target != null,say_text != undefined,object && object.outcome != undefined,target.getAttr('category') == 'usable')
	
	// If nothing's under the dragged item
	if (target == null) {
		dragged_item.setX(x);
		dragged_item.setY(y);
	}
	// Default text for unassigned item combinations + return item to inventory
	else if (say_text == undefined) {
		console.warn("Unassigned item combination text");
		dragged_item.setX(x);
		dragged_item.setY(y);
		setMonologue("default");
	}
	// Put something into a container
	else if (target != null && say_text != undefined && target.getAttr('category') == 'container') {
		var object = objects_json[target.getAttr('object_name')];
		var unlocked = undefined;

		// Can dragged object unlock locked container?
		if (object.locked === true && object.key == dragged_item.getId()) {
			object.locked = false;
			stage.get('#' + objects_json[target.getAttr('object_name')]['locked_image'])[0].hide();

			if (object.state == "empty")
				unlocked = "empty_image";
			else
				unlocked = "full_image";

			stage.get('#' + objects_json[target.getAttr('object_name')][unlocked])[0].show();
		}
		// Can dragged object be put into the container
		else if (object.state == 'empty' && object.in == dragged_item.getId()) {
			object.state = 'full';

			if (object.in == dragged_item.getId()) {
				stage.get('#' + objects_json[target.getAttr('object_name')]['empty_image'])[0].hide();
				stage.get('#' + objects_json[target.getAttr('object_name')]['full_image'])[0].show();

				// Remove dragged item
				destroy = true;
				current_layer.draw();
			}
		}
		setMonologue(dragged_item.getId(), target.getId());
	}
	// Unlock a door
	else if (target != null && say_text != undefined && target.getAttr('category') == 'door') {
		var object = objects_json[target.getAttr('object_name')];

		if (object.locked === true && object.state == 'locked' && object.key == dragged_item.getId()) {
			object.state = 'open';
			object.locked = false;

			stage.get('#' + object.locked_image)[0].hide();
			stage.get('#' + object.open_image)[0].show();
		}

		setMonologue(dragged_item.getId(), target.getId());
	}
	// Unblock an obstacle
	else if (target != null && say_text != undefined && target.getAttr('category') == 'obstacle') {
		var object = objects_json[target.getAttr('object_name')];

		if (object.blocking === true && object.trigger == dragged_item.getId()) {
			var blocked_object = objects_json[object.target];

			object.blocking = false;
			blocked_object.blocked = false;

			// TODO: What about other objects than door?
			stage.get('#' + blocked_object.blocked_image)[0].hide();
			stage.get('#' + blocked_object.closed_image)[0].show();

            // Check if the target is in the list of animated objects;
            // remove it from there if so. TODO: There should probably be
            // generic item/object destruction which checks if it was
            // animated.
            if (animated_objects.indexOf(target.getId()) > -1)
                animated_objects.splice(animated_objects.indexOf(target.getId()), 1);

			// TODO: unblocking_image, merge this with "use item on object"?
			target.destroy();

            // TODO: There should probably be generic item/object destruction
            // which checks if it has related parts.
			var related = objects_json[target.getAttr('id')].related;
			
			if (related && related.size != 0) {
				for (var i in related)
                {
                    var related_part = stage.get("#" + related[i])[0];
                    if (animated_objects.indexOf(related_part.getId() > -1))
                        animated_objects.splice(animated_objects.indexOf(related_part.getId()), 1);
					related_part.destroy();
                }
			}
		}
		setMonologue(dragged_item.getId(), target.getId());
	}
	// Use item on object
	else if (target != null && say_text != undefined && object && object.outcome != undefined && target.getAttr('category') == 'object') {
		setMonologue(dragged_item.getId(), target.getId());

		if (objects_json[dragged_item.getId()].trigger == target.getId()) {
			stage.get('#' + objects_json[dragged_item.getId()].outcome)[0].show();

			// Items may be consumed when used
			dragged_object = objects_json[dragged_item.getAttr('object_name')];
			if (dragged_item.getAttr('consume') === true)
				destroy = true;

            // The object is destroyed if it is the target of item's use
		    target.destroy();

            // Objects related to the target (i.e. the other "parts" of the
            // target are hidden as well
			var related = target.getAttr("related");
			if (related && related.size != 0) {
				for (var i in related)
					stage.get("#" + related[i])[0].hide();
			}
		}
	}
	// Use item on item
	else if (target != null && say_text != undefined && object && object.outcome != undefined && target.getAttr('category') == 'usable') {
		setMonologue(dragged_item.getId(), target.getId());
		if (objects_json[dragged_item.getId()].trigger == target.getId()) {

			stage.get('#' + objects_json[dragged_item.getId()].outcome)[0].show();

			inventoryAdd(stage.get('#' + objects_json[dragged_item.getId()].outcome)[0]);
			destroy = true;
			inventoryRemove(target);
		}
	}
	// Default for all others
	else {
		setMonologue(dragged_item.getId(), target.getId());
	}
	// Check if dragged item's destroyed, if not, add it to inventory
	if (destroy == false) {
		inventoryAdd(dragged_item);
	} else {
        dragged_item.hide();
        dragged_item.setDraggable(false);
        inventory_list.splice(inventory_list.indexOf(dragged_item), 1);
	}

	// Clearing the glow effects
	current_layer.getChildren().each(function(shape, i) {
		shape.setShadowBlur(0);
	});
	inventory_layer.getChildren().each(function(shape, i) {
		shape.setShadowBlur(0);
	});
	// Clearing the texts
	clearText(interaction_text);

	redrawInventory();
});
//Stop talking and clear monologue when clicked or touched anywhere on the screen
stage.on('touchstart mousedown', function(event) {
	clearText(monologue);
	stopTalking();
});
//Touch start and mouse down events (save the coordinates before dragging)
inventory_layer.on('touchstart mousedown', function(event) {
	x = event.targetNode.getX();
	y = event.targetNode.getY();
	//clearText(monologue);
});
//Inventory arrow clicking events
inventory_bar_layer.on('click tap', function(event) {
	interact(event);
});
//Interaction between items based on their category
function interact(event) {
	var target = event.targetNode;
	var target_category = target.getAttr('category');
	
	try {
		var ending = objects_json[target.getAttr('object_name')].ending;
	} catch(e) {
		var ending = false;
	}
	
	// Initiate ending
	if (ending)
		play_ending(ending);
		
	// Pick up an item
	else if (target_category == 'item') {
		setMonologue(target.getAttr('id'), 'pickup');
		if (target.getAttr('src2') != undefined) {
			stage.get('#' + target.getAttr('src2'))[0].show();
			inventoryAdd(stage.get('#' + target.getAttr('src2'))[0]);
			target.destroy();
		} else {
			inventoryAdd(target);
		}
		current_layer.draw();

		// To prevent multiple events happening at the same time
		event.cancelBubble = true;
		// Pick up a secret item
	} else if (target_category == 'secret') {
		setMonologue(target.getAttr('id'), 'pickup');
		var rewardID = target.getAttr('reward');
		stage.get('#'+rewardID)[0].show();
		inventoryAdd(stage.get('#'+rewardID)[0]);
		rewards++;
		target.destroy();
		current_layer.draw();

		// To prevent multiple events happening at the same time
		event.cancelBubble = true;
	}
	// Print examine texts for items, rewards and objects
	else if (target_category == 'object' || target_category == 'usable' || target_category == 'reward' || target_category == 'obstacle') {
		setMonologue(target.getAttr('id'));
	}
	// Take an item out of a container
	else if (target_category == 'container') {
		var object = objects_json[target.getAttr('object_name')];

		if (object.locked === false) {
			if (object.state == 'full') {
				object.state = 'empty';

				stage.get('#' + objects_json[target.getAttr('object_name')]['full_image'])[0].hide();
				stage.get('#' + objects_json[target.getAttr('object_name')]['empty_image'])[0].show();

				// Show and add the added inventory item
				var new_item = stage.get('#' + object.out)[0];
				new_item.show();
				inventoryAdd(new_item);

				current_layer.draw();
			}
		}

		setMonologue(target.getAttr('id'));
	}
	// Open a door or do a transition
	else if (target_category == 'door') {
		var object = objects_json[target.getAttr('object_name')];

		if (object.blocked === true)
			setMonologue(target.getAttr('id'));
			
		else if (object.state == 'closed') {
			setMonologue(target.getAttr('id'));
			if (object.locked === true) {
				object.state = 'locked';
				stage.get('#' + object.locked_image)[0].show();
			}
			else {
				object.state = 'open';
				stage.get('#' + object.open_image)[0].show();
			}
			target.hide();
			current_layer.draw();
		}
        else if (object.state == 'locked')
            setMonologue(target.getAttr('id'));
		else if (object.state == 'open') {
			do_transition(object.transition);
			setTimeout(function() {
				setMonologue(target.getId());
			}, 700);
		}
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

//Play the hardcoded end sequence and show the correct end screen based on the number of rewards found
function play_ending(ending) {
	var delay = 700;
	var ending_object = objects_json[ending];

	// Clear inventory except rewards
	for (var i = inventory_layer.children.length-1; i >= 0; i--) {
		var shape = inventory_layer.children[i];
		if (shape.getAttr('category') != 'reward')
			inventoryRemove(shape);
		inventory_index = 0;
	}
	
	if (ending_object.sequence)
		sequence_delay = play_sequence(ending_object.sequence, false);
	
	setTimeout(function() {
		current_layer = stage.get('#' + ending)[0];
		
		fade_layer.moveToTop();
		fade_layer.show();
		fade.play();
		setTimeout(function() {
			play_music(current_layer.getId());
			rewards_text = stage.get('#rewards_text')[0];
			old_text = rewards_text.getText();
			rewards_text.setText(rewards + rewards_text.getText());
						
			current_layer.show();
			
			inventory_bar_layer.show();
			inventory_bar_layer.moveToTop();
			
			inventory_layer.show();
			inventory_layer.moveToTop();
			
			display_menu(current_layer.getId());
			
			character_layer.show();
			character_layer.moveToTop();
			
			stage.get('#end_texts')[0].show();
			stage.get('#end_texts')[0].moveToTop();
			
			// Still keep fade layer on top
			fade_layer.moveToTop();
			
			stage.draw();
			rewards_text.setText(old_text);
			
			fade.reverse();
			setTimeout('fade_layer.hide();', 700);
		}, 700);
	}, sequence_delay);

}

//Set monologue text
function setMonologue(id, name) {
	if (name == null)
		name = 'examine';

	// Is there such an ID in JSON?
	var text = texts_json[id];
	if (!text) {
		console.warn("No JSON text entry found for", id);
		return;
	}
	text = text[name];

	// If no text found, use default text
	if (!text || text.length == 0) {
		// Item's own default
		console.warn("No text" ,name, "found for", id);
		text = texts_json[id]["default"];
		if (!text) {
			// Master default
			console.warn("Default text not found for", id, ". Using master default.");
			text = texts_json["default"]["examine"];
		}
	}
	
	monologue.setWidth('auto');
	speech_bubble.show();
	monologue.setText(text);
	if (monologue.getWidth() > 524) {
		monologue.setWidth(524);
		monologue.setText(text);
	}

	speech_bubble.setY(stage.getHeight() - 100 - 15 - monologue.getHeight() / 2);

	// Playing the speaking animation
	idle_1.hide();
	speak_1.show();
	speak_1_animation.play();

	text_layer.moveToTop();
	text_layer.draw();
	character_layer.draw();

	clearTimeout(monologue_timeout);
	monologue_timeout = setTimeout('stopTalking();', 3000);
}

//Clearing the given text
function clearText(text) {
	text.setText("");

	if (text.getId() == 'monologue') {
		speech_bubble.hide();
	}
	text_layer.draw();
}

//Stop the talking animations
function stopTalking() {
	character_layer.getChildren().each(function(shape, i) {
		shape.hide();
	});
	stage.get("#character_idle_1")[0].show();

	speak_1_animation.reset();
	speak_2_animation.reset();

	character_layer.draw();

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
		stage.get('#' + o.id)[0].setImage(window[o.id]);
	}();
	window[o.id].src = o.src;
}

//Adding an item to the inventory
function inventoryAdd(item) {
	item.moveTo(inventory_layer);
	item.clearImageHitRegion();
	item.setScale(1);
	item.setSize(80, 80);

	if (inventory_list.indexOf(item) > -1)
		inventory_list.splice(inventory_list.indexOf(item), 1, item);
	else
		inventory_list.push(item);
	redrawInventory();
}

//Removing an item from the inventory
function inventoryRemove(item) {
	item.hide();
	item.moveTo(current_layer);
	item.setDraggable(false);
	inventory_list.splice(inventory_list.indexOf(item), 1);
	redrawInventory();
}

//Dragging an item from the inventory
function inventoryDrag(item) {
	item.moveTo(current_layer);
	clearText(monologue);
	stopTalking();
	current_layer.moveToTop();
	character_layer.moveToTop();
	text_layer.moveToTop();
}

//Redrawing inventory
function redrawInventory() {
	inventory_layer.getChildren().each(function(shape, i) {
		shape.setAttr('visible', false);
		shape.setDraggable(false);
	});

	for(var i = inventory_index; i < Math.min(inventory_index + inventory_max, inventory_list.length); i++) {
		shape = inventory_list[i];
		if (shape.getAttr('category') != 'reward') {
			shape.setAttr('category', 'usable');
		}
		shape.setDraggable(true);
		shape.setX(offsetFromLeft + (inventory_list.indexOf(shape) - inventory_index) * 100);
		shape.setY(stage.getHeight() - 90);
		shape.setAttr('visible', true);
	}

	if(inventory_index > 0) {
		stage.get('#inventory_left_arrow').show();
	} else {
		stage.get('#inventory_left_arrow').hide();
	}

	if(inventory_index + inventory_max < inventory_list.length) {
		stage.get('#inventory_right_arrow').show();
	} else {
		stage.get('#inventory_right_arrow').hide();
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
