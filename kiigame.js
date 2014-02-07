// KineticJS JavaScript Framework http://www.kineticjs.com/ Copyright 2013, Eric Rowell. Licensed under the MIT license.

// Get jsons from the server
var images_json_text = getJSON('images.json');
var objects_json = JSON.parse(getJSON('objects.json'));
var legends_json = JSON.parse(getJSON('legends.json'));

// Create stage and everything in it from json
var stage = Kinetic.Node.create(images_json_text, 'container');

// Scale stage to window size
//stage.setWidth(window.innerWidth);
//stage.setHeight(window.innerHeight);

// Define variables from stage for easier use

// Texts & layers
var monologue = stage.get('#monologue')[0];
var speech_bubble = stage.get('#speech_bubble')[0];
var interaction_text = stage.get('#interaction_text')[0];

var start_layer = stage.get("#start_layer")[0];
var intro_layer = stage.get("#intro_layer")[0];
var outro_layer = stage.get("#outro_layer")[0];
var end_layer = stage.get("#end_layer")[0];

var background_layer = stage.get("#background_layer")[0];

var inventory_layer = stage.get('#inventory_layer')[0];
var inventory_bar_layer = stage.get("#inventory_bar_layer")[0];
var character_layer = stage.get('#character_layer')[0];
var text_layer = stage.get('#text_layer')[0];
var fade_layer = stage.get("#fade_layer")[0];

// Character frames
var speak_1 = stage.get('#character_speak_1')[0];
var speak_2 = stage.get('#character_speak_2')[0];
var idle_1 = stage.get('#character_idle_1')[0];
var idle_2 = stage.get('#character_idle_2')[0];
var panic = stage.get('#character_panic')[0];

// Scale background and UI elements
stage.get("#black_screen")[0].setSize(stage.getWidth(), stage.getHeight());
stage.get("#inventory_bar")[0].setY(stage.getHeight() - 100);
stage.get("#inventory_bar")[0].setWidth(stage.getWidth());

// Make a json object from the json string
var images_json = stage.toObject();

// TODO: Dynamize this, maybe combine object_layer and background layers?
//       We have the "start": true there already
// Variable for saving the current room (for changing backgrounds and object layers)
var current_background = 'start_layer';

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

// Music
// Different browsers and different browser versions support different formats. MP3 should work with in all the major
// browsers in current versions.
var current_music;
var start_music = new Audio(stage.get('#start_layer')[0].attrs.music);
var intro_music = new Audio(stage.get('#intro_layer')[0].attrs.music);
var end_music = new Audio(stage.get('#end_layer')[0].attrs.music);
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
    
    // TODO: Playing everything at once can end up being laggy
    animation.play();
}

// Creating all image objects from json file based on their attributes
for (var i = 0; i < images_json.children.length; i++) {
	for (var j = 0; j < images_json.children[i].children.length; j++) {
		if (images_json.children[i].children[j].className == 'Image') {
			createObject(images_json.children[i].children[j].attrs);
            
            if (images_json.children[i].children[j].attrs.object_type == "animation")
            	create_animation(stage.get('#'+images_json.children[i].children[j].attrs.id)[0]);
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
    
	stage.draw();
	idle_1_animation.play();
}

stage.get('#begining')[0].on('tap click', function(event) {
	stage.get('#begining')[0].hide();
	inventory_bar_layer.show();
	character_layer.show();
	background_layer.show();
	stage.draw();
	
	current_music = start_music;
	start_music.play();
});

// On clicking the start game we open the choosing the jersey number
stage.get('#start_game')[0].on('tap click', function(event) {
    // TODO: Default game launch logic, after doing dynamic sequences
    //play_intro()
    play_sequence("intro_layer", "locker_room_1");
});

/*
Plays a sequence defined in JSON
string sequence - the sequence ID from JSON
string post_sequence_image - the image displayed after sequence
*/
function play_sequence(sequence, post_sequence_image) {
	// Animation cycle for proper fading and drawing order
	fade_layer.moveUp();
	fade_layer.show();
	fade.play();
	
	current_music.pause();
	
	var sequence_layer = stage.get("#"+sequence);
    sequence_layer.show();
    
    sequence_music = new Audio(sequence_layer[0].attrs.music);
    current_music = sequence_music;
    
    var delay = 700;
    var sequence_counter = 0;
	sequence_layer[0].children.each(function(image) {
	    
        setTimeout(function() {
		    fade_layer.show();
		    fade.play();
		    
		    if (sequence_counter == 0)
		        sequence_music.play();
		        
            character_layer.hide();
            inventory_bar_layer.hide();
                    
            image.show();
            
            var image_fade = image.attrs.do_fade;
            if (image_fade === true) {
                setTimeout(function() {
                    fade.reverse();
                    stage.draw();
                    setTimeout('fade_layer.hide();', 700);
                }, 700);
            }
            // Immediately revert fade layer
            else {
                fade.reverse();
                stage.draw();
                fade_layer.hide();
            }
            
            sequence_counter += 1;
            
            // Last image in the sequence
		    if (sequence_counter == sequence_layer[0].children.length) {
                fade_layer.show();
                wakeup.finish();
                
                setTimeout(function() {
                    current_music.pause();
                    wakeup.reverse();
                    intro_layer.hide();
                    
                    stage.get("#"+post_sequence_image)[0].show();
                    current_layer.show();
                    inventory_bar_layer.show();
                    character_layer.show();
                    
                    stage.draw();
                    setTimeout(function() {
                        fade_layer.hide();
                        stage.get("#black_screen")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
                        fade_layer.moveDown();
                        
                        var end_text = sequence_layer[0].attrs.end_text;
                        if (end_text && end_text.length != 0)
                            setMonologue(end_text);
                    }, 3000);
                }, 1500);
                
                return;
		    }
            
        }, delay);
        delay = delay + image.attrs.show_time;
	});
}

// Listener and showing of credits on the start screen
stage.get('#start_credits')[0].on('tap click', function(event) {
	event = event.targetNode;
	setMonologue(event.getAttr('credits'));
});
// Developer feature - shortcut menu from the empty menu button for testing purposes
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

// Mouse up and touch end events (picking up items from the environment
// Start layer for the shortcut developer menu
start_layer.on('mouseup touchend', function(event) {
	interact(event);
});

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
		setMonologue("Ei pysty, liian hapokasta.");
	}
	// Put something into a container
	else if (target != null && dragged_item.getAttr(target.getId()) != undefined && target.getAttr('category') == 'container') {
    	var object = objects_json[target.getAttr('object_name')];
        
        if (object.locked === true && object.key == dragged_item.getId()) {
        	object.locked = false;
            stage.get('#' + objects_json[target.getAttr('object_name')]['locked_image'])[0].hide();
            
            if (object.state == "empty")
            	var unlocked = "empty_image";
            else
            	var unlocked = "full_image";
                
            stage.get('#' + objects_json[target.getAttr('object_name')][unlocked])[0].show();
        }
        if (object.state == 'empty') {
        	object.state = 'full';
            
			if (object.in == dragged_item.getId()) {
     	   		stage.get('#' + objects_json[target.getAttr('object_name')]['empty_image'])[0].hide();
        		stage.get('#' + objects_json[target.getAttr('object_name')]['full_image'])[0].show();
        
            	// Remove dragged item
				inventoryRemove(dragged_item);
       	 
       	 		current_layer.draw();
        	}
        }
        setMonologue(dragged_item.getAttr(target.getId()));
        
        dragged_item.setX(x);
        dragged_item.setY(y);
        
		current_layer.draw();
	}
	// Use item on object
	else if (target != null && dragged_item.getAttr(target.getId()) != undefined && dragged_item.getAttr('outcome') != undefined && target.getAttr('category') == 'object') {
		setMonologue(dragged_item.getAttr(target.getId()));
		if (dragged_item.getAttr('trigger') == target.getId()) {
			stage.get('#' + dragged_item.getAttr('outcome'))[0].show();
			dragged_item.destroy();
			target.destroy();
            var related = target.getAttr("related");
			if (related && related.size != 0) {
            	for (var i in related)
            		stage.get("#" + related[i])[0].hide();
                /*
				cieni_eyes_animation.destroy();
				cieni_mouth_animation.destroy();
				cieni_eyes_decal.hide();
				cieni_mouth_decal.hide();
                */
                
                redrawInventory();
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
        
        setMonologue(target.getAttr('use'));
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
            /*
			current_layer.getChildren().each(function(shape, i) {
            	if (shape.getAttr("object_type") == "animation") {
                	if (shape.isVisible()) {
                    	cieni_eyes_animation.play();
						cieni_mouth_animation.play();
                    }
                }
                
			});
			*/
			/*
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
			*/
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
	
	current_music = end_music;
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
		inventory_bar_layer.hide();
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
			inventory_bar_layer.show();
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
	item.hide();
	item.moveTo(current_layer);
	item.setDraggable(false);
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
