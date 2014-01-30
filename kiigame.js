// KineticJS JavaScript Framework http://www.kineticjs.com/ Copyright 2013, Eric Rowell. Licensed under the MIT license.

// Get jsons from the server
var objects_json_text = getJSON('objects.json');
var legends_json = JSON.parse(getJSON('legends.json'));

// Create stage and everything in it from json
var stage = Kinetic.Node.create(objects_json_text, 'container');

// Scale stage to window size
//stage.setWidth(window.innerWidth);
//stage.setHeight(window.innerHeight);

// Define variables from stage for easier use

// Texts & layers
var monologue = stage.get('#monologue')[0];
var speech_bubble = stage.get('#speech_bubble')[0];
var interaction_text = stage.get('#interaction_text')[0];

// TODO: Make this dynamic and the whole jersey input thing
var input_text = stage.get('#input_text')[0];

var start_layer = stage.get("#start_layer")[0];
var input_layer = stage.get('#input_layer')[0];
var intro_layer = stage.get("#intro_layer")[0];
var outro_layer = stage.get("#outro_layer")[0];
var end_layer = stage.get("#end_layer")[0];

var background_layer = stage.get("#background_layer")[0];

var inventory_layer = stage.get('#inventory_layer')[0];
var character_layer = stage.get('#character_layer')[0];
var text_layer = stage.get('#text_layer')[0];
var fade_layer = stage.get("#fade_layer")[0];

// Character frames
var speak_1 = stage.get('#character_speak_1')[0];
var speak_2 = stage.get('#character_speak_2')[0];
var idle_1 = stage.get('#character_idle_1')[0];
var idle_2 = stage.get('#character_idle_2')[0];
var panic = stage.get('#character_panic')[0];

// TODO: Scenario-specific animations need to be dynamic
//       Maybe add animation attribute to JSON cieni_x with the desired animation code
// Decals of the cieni
var cieni_eyes_decal = stage.get('#cieni_eyes')[0];
var cieni_mouth_decal = stage.get('#cieni_mouth')[0];

// TODO: locker_room1/2 need to be dynamic
// Scale background and UI elements
stage.get("#locker_room_1")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
stage.get("#locker_room_2")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
stage.get("#black_screen")[0].setSize(stage.getWidth(), stage.getHeight());
stage.get("#inventory_bar")[0].setY(stage.getHeight() - 100);
stage.get("#inventory_bar")[0].setWidth(stage.getWidth());

// Make a json object from the json string
var objects_json = stage.toObject();

// TODO: Dynamize this
// Variable for saving the current room (for changing backgrounds and object layers)
var current_background = 'locker_room_1';

// The amount of rewards found
var rewards = 0;

// Timeout event for showing monologue animation for certain duration
var monologue_timeout;

// Temporary location for inventory items if they need to be moved back to the location because of invalid interaction
var x;
var y;

// For limiting the amount of intersection checks
var delayEnabled = false;

// For checking whether player has selected their jersey number
var number_selected = false;

// TODO: Music needs to be defined dynamically
// Music
// Different browsers and different browser versions support different formats. MP3 should work with in all the major
// browsers in current versions.
var start_music = new Audio('audio/alku_musax_mono_20131213.mp3');
var intro_music = new Audio('audio/intro_mono_20131213.mp3');
var end_music = new Audio('audio/loppu_musax_mono_20131213.mp3');
start_music.loop = true;

// The item dragged from the inventory
var dragged_item;

// Intersection target (object below dragged item)
var target;

// Animation for fading the screen
var fade = new Kinetic.Tween({
	node : fade_layer,
	duration : 0.6,
	opacity : 1
});

var wakeup = new Kinetic.Tween({
	node : fade_layer,
	duration : 3,
	opacity : 1
});

// Speak animation
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
// Character's idle animation
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

// TODO: This should be defined somewhere else, maybe JSON or own latkazombit.js file
// Cieni's eye animation
var cieni_eyes_animation = new Kinetic.Tween({
	node : cieni_eyes_decal,
	x : cieni_eyes_decal.getX() - 10,
	easing : Kinetic.Easings.EaseInOut,
	duration : 1.4,
	onFinish : function() {
		cieni_eyes_animation.reverse();
		setTimeout('cieni_eyes_animation.play();', 1400);
	}
});

// TODO: Same as above
// Cieni's mouth animation
var cieni_mouth_animation = new Kinetic.Tween({
	node : cieni_mouth_decal,
	x : cieni_mouth_decal.getX() + 9,
	y : cieni_mouth_decal.getY() - 3,
	width : cieni_mouth_decal.getWidth() - 15,
	easing : Kinetic.Easings.EaseInOut,
	duration : 1.9,
	onFinish : function() {
		cieni_mouth_animation.reverse();
		setTimeout('cieni_mouth_animation.play();', 1900);
	}
});

// Creating all image objects from json file based on their attributes
for (var i = 0; i < objects_json.children.length; i++) {
	for (var j = 0; j < objects_json.children[i].children.length; j++) {
		if (objects_json.children[i].children[j].className == 'Image') {
			createObject(objects_json.children[i].children[j].attrs);
		}
	}
}

// On window load we create image hit regions for our items on object layers
// Some items ended up being excluded from this
window.onload = function() {
    // Loop backgrounds to create item hit regions and register mouseup event
    background_layer.getChildren().each(function(o) {        
        object_layer = stage.get('#'+o.attrs.objects)[0];
        
        if (object_layer != undefined) {
            object_layer.getChildren().each(function(shape, i) {
                if (shape.getAttr('category') != 'secret' && shape.className == 'Image') {
                    shape.createImageHitRegion(function() {
                    });
                }
            });
            
            object_layer.on('mouseup touchend', function(event) {
                interact(event);
            });
            
            // Current layer for hit region purposes in different rooms
            if (object_layer.getAttr('start') == 'true') {
                current_layer = object_layer;
            }
        }
    });
    
    // TODO: Find out why these item exceptions such as 'tactic_board_wiper' exist
    //       => Otherwise these comments can be removed
    /*
	object_layer_locker_room_1.getChildren().each(function(shape, i) {
		if (shape.getAttr('category') != 'secret' && shape.className == 'Image' && shape.getId() != 'tactic_board_wiper') {
			shape.createImageHitRegion(function() {
			});
		}
	});
	object_layer_locker_room_2.getChildren().each(function(shape, i) {
		if (shape.getAttr('category') != 'secret' && shape.className == 'Image' && shape.getId() != 'tag_on_wall' && shape.getId() != 'marker') {
			shape.createImageHitRegion(function() {
			});
		}
	});
	object_layer_wc_1.getChildren().each(function(shape, i) {
		if (shape.getAttr('category') != 'secret' && shape.className == 'Image' && shape.getId() != 'library_receipt') {
			shape.createImageHitRegion(function() {
			});
		}
	});
	object_layer_wc_2.getChildren().each(function(shape, i) {
		if (shape.getAttr('category') != 'secret' && shape.className == 'Image' && shape.getId() != 'hairkeeper') {
			shape.createImageHitRegion(function() {
			});
		}
	});
	object_layer_shower_room.getChildren().each(function(shape, i) {
		if (shape.getAttr('category') != 'secret' && shape.className == 'Image' && shape.getId() != 'shower_left' && shape.getId() != 'shower_middle' && shape.getId() != 'shower_right' ) {
			shape.createImageHitRegion(function() {
			});
		}
	});
	character_layer.getChildren().each(function(shape, i) {
		if (shape.className == 'Image') {
			shape.createImageHitRegion(function() {
			});
		}
	});
	*/
	stage.draw();
	idle_1_animation.play();
}

stage.get('#begining')[0].on('tap click', function(event) {
	stage.get('#begining')[0].hide();
	character_layer.show();
	background_layer.show();
	stage.draw();
	start_music.play();
});

// TODO: The jersey logic is for this scenario and should be dynamic (latkazombit.js?)
// On clicking the start game we open the choosing the jersey number
stage.get('#start_game')[0].on('tap click', function(event) {
	input_layer.show();
	input_layer.draw();
});
// Listeners for the input screen buttons
input_layer.on('tap click', function(event) {
	target = event.targetNode;
	selected = target.getName();

	// Number buttons
	if (parseInt(selected) >= 0 && parseInt(selected) <= 9) {
		switch(parseInt(selected)) {
			case 0:
				if (input_text.getText() != 0 && input_text.getText().length < 2) {
					input_text.setText(input_text.getText() + "0");
				}
				break;
			case 1:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("1");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "1");
					}
				}
				break;
			case 2:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("2");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "2");
					}
				}
				break;
			case 3:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("3");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "3");
					}
				}
				break;
			case 4:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("4");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "4");
					}
				}
				break;
			case 5:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("5");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "5");
					}
				}
				break;
			case 6:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("6");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "6");
					}
				}
				break;
			case 7:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("7");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "7");
					}
				}
				break;
			case 8:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("8");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "8");
					}
				}
				break;
			case 9:
				if (input_text.getText().length < 2) {
					if (number_selected == false) {
						input_text.setText("9");
						number_selected = true;
					} else {
						input_text.setText(input_text.getText() + "9");
					}
				}
				break;
		}
		// Backspace
	} else if (selected == 'Pyyhi') {
		if (input_text.getText().length > 0) {
			input_text.setText(input_text.getText().slice(0, -1));
		}
		// OK
	} else if (selected == 'OK' && input_text.getText().length > 0) {
		stage.get('#jersey_number')[0].setText(input_text.getText());
		stage.get('#jersey_number')[0].setAttr('examine', input_text.getAttr('wikistart') + input_text.getText() + input_text.getAttr('wikiend') + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia);
		stage.get('#icehockey_jersey')[0].setAttr('examine', input_text.getAttr('wikistart') + input_text.getText() + input_text.getAttr('wikiend') + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia);
		play_intro();
	}
	// Test feature - show the legend text when clicking the jersey
	/*
	else if (selected == 'Pelipaita' || selected == 'Pelinumero') {
		if (input_text.getText() > 0) {
			stage.get('#input_text')[0].setAttr('examine', input_text.getAttr('wikistart') + input_text.getText() + input_text.getAttr('wikiend') + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia);
			stage.get('#jersey')[0].setAttr('examine', input_text.getAttr('wikistart') + input_text.getText() + input_text.getAttr('wikiend') + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia);
			interact(event);
		}
	}*/
	// If no number, grey out buttons that can't be used
	if (input_text.getText().length == 0) {
		stage.get('#button_ok').hide();
		stage.get('#button_ok_gray').show();
		stage.get('#button_back').hide();
		stage.get('#button_back_gray').show();
		stage.get('#button_0').hide();
		stage.get('#button_0_gray').show();
	} else {
		stage.get('#button_ok').show();
		stage.get('#button_ok_gray').hide();
		stage.get('#button_back').show();
		stage.get('#button_back_gray').hide();
		stage.get('#button_0').show();
		stage.get('#button_0_gray').hide();
	}
	input_layer.draw();

});

// TODO: This kind of sequences could be defined in JSON and run here dynamically
//       JSON could describe the images in orded, some kind of timing notation and music
// Play the hardcoded intro sequence
function play_intro() {
    // Current delay (ms) to manage the time pictures are visible
	var delay = 700;
	
	// Animation cycle for proper fading and drawing order
	fade_layer.moveUp();
	fade_layer.show();
	fade.play();

	start_music.pause();

	setTimeout(function() {
		start_layer.hide();
		character_layer.hide();
		stage.get("#inventory_bar")[0].hide();
		input_layer.hide();
		intro_layer.show();

		intro_music.play();

		fade.reverse();
		stage.draw();
		setTimeout('fade_layer.hide();', 700);
	}, delay);
	delay = delay + 4000;

	setTimeout(function() {
		fade_layer.show();
		fade.play();
		setTimeout(function() {
			stage.get("#intro_1")[0].hide();
			stage.get("#intro_2")[0].show();
			fade.reverse();
			stage.draw();
			setTimeout('fade_layer.hide();', 700);
		}, 700);
	}, delay);
	delay = delay + 5000;

	setTimeout(function() {
		fade_layer.show();
		fade.play();
		setTimeout(function() {
			stage.get("#intro_2")[0].hide();
			stage.get("#intro_3")[0].show();
			fade.reverse();
			stage.draw();
			setTimeout('fade_layer.hide();', 700);
		}, 700);
	}, delay);
	delay = delay + 4500;

	setTimeout(function() {
		stage.get("#intro_3")[0].hide();
		stage.get("#intro_4")[0].show();
		intro_layer.draw();
	}, delay);
	delay = delay + 1000;

	setTimeout(function() {
		stage.get("#intro_4")[0].hide();
		stage.get("#intro_5")[0].show();
		intro_layer.draw();
	}, delay);
	delay = delay + 1000;

	setTimeout(function() {
		stage.get("#intro_5")[0].hide();
		stage.get("#intro_6")[0].show();
		intro_layer.draw();
	}, delay);
	delay = delay + 1000;
	
	setTimeout(function() {
		fade_layer.show();
		wakeup.finish();

		setTimeout(function() {
			wakeup.reverse();
			intro_layer.hide();
			stage.get("#locker_room_1")[0].show();
			stage.get("#inventory_bar")[0].show();
			current_layer.show();
			character_layer.show();
			stage.draw();
			setTimeout(function() {
				fade_layer.hide();
				stage.get("#black_screen")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
				fade_layer.moveDown();
				setMonologue(intro_layer.getAttr('waking_text'));
			}, 3000);
		}, 1500);
	}, delay);
}

// Listener and showing of credits on the start screen
stage.get('#start_credits')[0].on('tap click', function(event) {
	event = event.targetNode;
	setMonologue(event.getAttr('credits'));
});
// Developer feature - shortcut menu from the empty menu button for testing purposes
/*
	stage.get('#start_empty')[0].on('tap click', function(event) {
	event = event.targetNode;
	var clone;
	
	clone = stage.get('#locker_room_1_door_to_wc_open')[0].clone({
		visible : true,
		x : 600
	});
	clone.moveTo(start_layer);
	clone = stage.get('#shower_door_to_locker_room_2_open')[0].clone({
		visible : true
	});
	clone.moveTo(start_layer);
	clone = stage.get('#shower_door_to_locker_room_1')[0].clone({
		x : 330
	});
	clone.moveTo(start_layer);

	stage.draw();
});
*/

// TODO: This needs to be dynamic
// Hidden feature, click the image on the start screen and get a funny reaction from the character
stage.get('#start')[0].on('tap click', function(event) {
	event = event.targetNode;

	setMonologue(panic.getAttr('text'));
	setTimeout(function() {
		idle_1.hide();
		panic.show();
		setTimeout('panic.hide(); idle_1.show();', 2000);
	}, 1000);
});
// Mouse up and touch end events (picking up items from the environment
// Start layer for the shortcut developer menu
/*
start_layer.on('mouseup touchend', function(event) {
	interact(event);
});
*/

// Mouse click and tap events (examine items in the inventory)
inventory_layer.on('click tap', function(event) {
	interact(event);
});
// Drag start events
stage.get('Image').on('dragstart', function(event) {
	dragged_item = event.targetNode;
	dragged_item.moveToTop();
	clearText(monologue);
	stopTalking();
	inventory_layer.draw();
});
// While dragging events (use item on item or object)
stage.on('dragmove', function(event) {
	dragged_item = event.targetNode;

	if (!delayEnabled) {
		// Setting a small delay to not spam intersection check on every moved pixel
		setDelay(10);

		// Loop through all the items on the current object layer
		for (var i = 0; i < current_layer.children.length; i++) {
			var object = (current_layer.getChildren())[i];
			if (object != undefined) {
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

			interaction_text.setText(target.getName());
			interaction_text.setX(dragged_item.getX() + (dragged_item.getWidth() / 2));
			interaction_text.setY(dragged_item.getY() - 30);
			interaction_text.setOffset({
				x : interaction_text.getWidth() / 2
			});
			current_layer.draw();
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
			current_layer.draw();
		}
	}
});
// Basic intersection check; checking whether corners of the dragged item are inside the area of the intersecting object
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

// Drag end events
stage.get('Image').on('dragend', function(event) {
	dragged_item = event.targetNode;

	// If nothing's under the dragged item
	if (target == null) {
		dragged_item.setX(x);
		dragged_item.setY(y);
	}
	// Default text for unassigned item combinations + return item to inventory
	else if (dragged_item.getAttr(target.getId()) == undefined) {
		dragged_item.setX(x);
		dragged_item.setY(y);
		// TODO: Default text possible to set dynamically?
		setMonologue("Ei pysty, liian hapokasta.");
	}
	// Put something into a container
	else if (target != null && dragged_item.getAttr(target.getId()) != undefined && dragged_item.getAttr('outcome') != undefined && stage.get('#' + dragged_item.getAttr('outcome'))[0].getAttr('category') == 'container') {
		setMonologue(dragged_item.getAttr(target.getId()));
		if (dragged_item.getAttr('trigger') == target.getId()) {
			stage.get('#' + dragged_item.getAttr('outcome'))[0].show();
            if (dragged_item.getAttr('consume')){
            	dragged_item.destroy();
            }
			target.hide();
			redrawInventory();
		} else {
			dragged_item.setX(x);
			dragged_item.setY(y);
		}
		current_layer.draw();
	}
	// Use item on object
	else if (target != null && dragged_item.getAttr(target.getId()) != undefined && dragged_item.getAttr('outcome') != undefined && target.getAttr('category') == 'object') {
		setMonologue(dragged_item.getAttr(target.getId()));
		if (dragged_item.getAttr('trigger') == target.getId()) {
			stage.get('#' + dragged_item.getAttr('outcome'))[0].show();
			if (dragged_item.getAttr('consume')){
            	dragged_item.destroy();
            }
			//target.destroy();
			redrawInventory();
			
			// TODO: This needs to be dynamic
			if (target.getName() == "Sieni") {
				cieni_eyes_animation.destroy();
				cieni_mouth_animation.destroy();
				cieni_eyes_decal.hide();
				cieni_mouth_decal.hide();
			}
		} else {
			dragged_item.setX(x);
			dragged_item.setY(y);
		}
		current_layer.draw();
	}
	// Use item on item
	else if (target != null && dragged_item.getAttr(target.getId()) != undefined && dragged_item.getAttr('outcome') != undefined && target.getAttr('category') == 'usable') {
		setMonologue(dragged_item.getAttr(target.getId()));
		if (dragged_item.getAttr('trigger') == target.getId()) {
			stage.get('#' + dragged_item.getAttr('outcome'))[0].show();
			inventoryAdd(stage.get('#' + dragged_item.getAttr('outcome'))[0]);
			dragged_item.destroy();
			target.destroy();
			redrawInventory();
		} else {
			dragged_item.setX(x);
			dragged_item.setY(y);
		}
		current_layer.draw();
	}
	
    // TODO: This needs to be dynamic. Does removing this even effect anything?
	// DNA analysis
	else if (target != null && dragged_item.getAttr(target.getId()) != undefined) {
		dragged_item.setX(x);
		dragged_item.setY(y);
		setMonologue(dragged_item.getAttr(target.getId()));
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

	// Stopping the talking animation after certain period of time
	clearTimeout(monologue_timeout);
	monologue_timeout = setTimeout('stopTalking()', 3000);

	current_layer.draw();
	inventory_layer.draw();
});
// Stop talking and clear monologue when clicked or touched anywhere on the screen
stage.on('touchstart mousedown', function(event) {
	clearText(monologue);
	stopTalking();
});
// Touch start and mouse down events (save the coordinates before dragging)
inventory_layer.on('touchstart mousedown', function(event) {
	x = event.targetNode.getX();
	y = event.targetNode.getY();
	//clearText(monologue);
});
// Interaction between items based on their category
function interact(event) {
	var target = event.targetNode;

	// Pick up an item
	if (target.getAttr('category') == 'item') {
		setMonologue(target.getAttr('pickup'));
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
	} else if (target.getAttr('category') == 'secret') {
		setMonologue(target.getAttr('pickup'));
		target.destroy();
		
		// TODO: Dynamic number of secrets
		// Always give the rewards in the same order, despite what order the secrets are found in
		switch (rewards) {
			case 0:
				inventoryAdd(stage.get('#book_reward_1')[0]);
				rewards++;
				stage.get('#book_reward_1')[0].show();
				break;
			case 1:
				inventoryAdd(stage.get('#book_reward_2')[0]);
				rewards++;
				stage.get('#book_reward_2')[0].show();
				break;
			case 2:
				inventoryAdd(stage.get('#book_reward_3')[0]);
				rewards++;
				stage.get('#book_reward_3')[0].show();
				break;
		}
		current_layer.draw();
		inventory_layer.draw();

		// To prevent multiple events happening at the same time
		event.cancelBubble = true;
	}
	// Print examine texts for items, rewards and objects
	else if (target.getAttr('category') == 'object' || target.getAttr('category') == 'usable' || target.getAttr('category') == 'reward') {
		setMonologue(target.getAttr('examine'));
	}
	// Take an item out of a container
	else if (target.getAttr('category') == 'container') {
		setMonologue(target.getAttr('use'));
		stage.get('#' + target.getAttr('original'))[0].show();
		stage.get('#' + target.getAttr('outcome'))[0].show();
		inventoryAdd(stage.get('#' + target.getAttr('outcome'))[0]);
		target.destroy();
		current_layer.draw();
	}
	// Open a door
	else if (target.getAttr('category') == 'door') {
		setMonologue(target.getAttr('use'));
		stage.get('#' + target.getAttr('outcome'))[0].show();
		target.destroy();
		current_layer.draw();
	}
	// Use a transition (move between areas)
	else if (target.getAttr('category') == 'transition') {
		// Fading a black screen during the transition
		fade_layer.show();
		fade.play();

		// Animation cycle for proper fading and drawing order
		setTimeout(function() {
			stage.get('#' + current_background)[0].hide();
			target.getParent().hide();
			current_background = target.getAttr('outcome');
			current_layer = stage.get('#object_layer_' + current_background)[0];

			stage.get('#' + target.getAttr('outcome'))[0].show();
			stage.get('#object_layer_' + target.getAttr('outcome'))[0].show();
			
			// TODO: Dynamic implementation doesn't want cieni here
			// Ensuring the cieni animations' playback only when it's safe, in the shower room
			if (current_background == "shower_room") {
				if (cieni_eyes_decal.isVisible()) {
					cieni_eyes_animation.play();
					cieni_mouth_animation.play();
				}
			}
			// If the cieni hasn't been erased and the room changes, reset the animations
			else {
				if (cieni_eyes_decal.isVisible()) {
					cieni_eyes_animation.reset();
					cieni_mouth_animation.reset();
				}
			}

			fade.reverse();
			stage.draw();
			setTimeout('fade_layer.hide();', 700);
			setMonologue(target.getAttr("use"));
		}, 700);
	}
	// Initiate ending
	else if (target.getAttr('category') == 'ending') {
		play_ending();
	}
}

// TODO: Dynamic sequences + some sort of dynamic reward screen logic?
// Play the hardcoded end sequence and show the correct end screen based on the number of rewards found
function play_ending() {
	/*
	fade_layer.show();
	fade_layer.moveDown();
	fade.play();
	setMonologue(stage.get("#poster_onthewall")[0].getAttr("use"));
	setTimeout(function() {
	stage.get('#' + current_background)[0].hide();
	object_layer_locker_room_2.hide();
	inventory_layer.getChildren().each(function(shape, i) {
	if(shape.getAttr('category') != 'reward') {
	inventoryRemove(shape);
	}
	});
	inventory_layer.getChildren().each(function(shape, i) {
	if(shape.getAttr('category') != 'reward') {
	inventoryRemove(shape);
	}
	});
	redrawInventory();
	end_music.play();

	stage.draw();
	setTimeout(function() {
	interaction_text.setX(stage.getWidth() / 2);
	interaction_text.setOffset({
	x : 300
	});
	interaction_text.setY(stage.getHeight() / 2 - 100);
	interaction_text.setFontSize(40);
	interaction_text.setStrokeWidth(0);
	interaction_text.setText("Pako onnistui!\n\n" + rewards + end_layer.getAttr('text'));
	stage.draw();
	}, 700);
	}, 700);
	*/

	var delay = 700;

	// Animation cycle for proper fading and drawing order

	fade_layer.moveToTop();
	stage.get("#black_screen")[0].setSize(stage.getWidth(), stage.getHeight());
	fade_layer.show();
	fade.play();
	end_music.play();

	setTimeout(function() {
		stage.get('#' + current_background)[0].hide();
		stage.get('#object_layer_' + current_background)[0].hide();
		inventory_layer.hide();
		inventory_layer.getChildren().each(function(shape, i) {
			if (shape.getAttr('category') != 'reward') {
				inventoryRemove(shape);
			}
		});
		// Without this, sometimes there's a random item left in the inventory. Wiper and dna-analyzer were spotted
		inventory_layer.getChildren().each(function(shape, i) {
			if (shape.getAttr('category') != 'reward') {
				inventoryRemove(shape);
			}
		});
		redrawInventory();

		character_layer.hide();
		stage.get("#inventory_bar")[0].hide();
		outro_layer.show();

		fade.reverse();
		stage.draw();
		setTimeout('fade_layer.hide();', 700);
	}, delay);
	delay = delay + 4000;

	setTimeout(function() {
		fade_layer.show();
		fade.play();
		setTimeout(function() {
			outro_layer.hide();
			switch (rewards) {
				case 0:
					stage.get('#end_picture_0')[0].show();
					break;
				case 1:
					stage.get('#end_picture_1')[0].show();
					break;
				case 2:
					stage.get('#end_picture_2')[0].show();
					break;
				case 3:
					stage.get('#end_picture_3')[0].show();
					break;
			}
			end_layer.moveUp();	
			stage.get('#rewards_text')[0].setText(rewards + stage.get('#rewards_text')[0].getText());
			end_layer.show();
			stage.get("#inventory_bar")[0].show();
			inventory_layer.show();
			character_layer.show();
			stage.draw();
			fade.reverse();
			setTimeout('fade_layer.hide();', 700);
		}, 700);
	}, delay);

}

// Set monologue text
function setMonologue(text) {
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

	text_layer.draw();
	character_layer.draw();

	clearTimeout(monologue_timeout);
	monologue_timeout = setTimeout('stopTalking();', 3000);
}

// Clearing the given text
function clearText(text) {
	text.setText("");

	if (text.getId() == 'monologue') {
		speech_bubble.hide();
	}
	text_layer.draw();
}

// Stop the talking animations
function stopTalking() {
	character_layer.getChildren().each(function(shape, i) {
		shape.hide();
	});
	stage.get("#character_idle_1")[0].show();

	speak_1_animation.reset();
	speak_2_animation.reset();

	character_layer.draw();

}

// Load json from the server
function getJSON(json_file) {
	var request = new XMLHttpRequest();
	request.open("GET", json_file, false);
	request.send(null)
	var json = request.responseText;
	return json;
}

// Setting an image to the stage and scaling it based on relative values if they exist
function createObject(o) {
	window[o.id] = new Image();
	window[o.id].onLoad = function() {
		stage.get('#' + o.id)[0].setImage(window[o.id]);
	}();
	window[o.id].src = o.src;
}

// Adding an item to the inventory
function inventoryAdd(item) {
	item.moveTo(inventory_layer);
	item.clearImageHitRegion();
	item.setScale(1);
	item.setSize(80, 80);
	if (item.getAttr('category') != 'reward') {
		item.setAttr('category', 'usable');
	}
	item.setDraggable(true);

	redrawInventory();
}

// Removing an item from the inventory
function inventoryRemove(item) {
	item.destroy();

	redrawInventory();
}

// Redrawing inventory
function redrawInventory() {
	// Offset from left for drawing inventory items starting from proper position
	var offsetFromLeft = 30;

	inventory_layer.getChildren().each(function(shape, i) {
		shape.setX(offsetFromLeft + i * 100);
		shape.setY(stage.getHeight() - 90);
	});

	/*
	 for(var i = 0; i < inventory_layer.getChildren().length; i++) {
	 inventory_layer.getChildren()[i].setX(offsetFromLeft + i * 100);
	 inventory_layer.getChildren()[i].setY(stage.getHeight() - 90);
	 }*/
	inventory_layer.draw();
}

// Delay to be set after each intersection check
function setDelay(delay) {
	delayEnabled = true;
	setTimeout('delayEnabled = false;', delay);
}
