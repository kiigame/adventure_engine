import { KiiGame } from './kiigame.js';
import DefaultInteractionResolver from './model/DefaultInteractionResolver.js';
import HitRegionInitializer from './view/stage/HitRegionInitializer.js';
import HitRegionFilter from './view/stage/hitregion/HitRegionFilter.js';
import Intersection from './view/Intersection.js';
import VisibilityValidator from './view/intersection/VisibilityValidator.js';
import CategoryValidator from './view/intersection/CategoryValidator.js';
import JSONGetter from './util/JSONGetter.js';

let kiigame = new KiiGame(
    null,
    null,
    [
        new DefaultInteractionResolver('item'),
        new DefaultInteractionResolver('furniture'),
        new DefaultInteractionResolver('reward'),
        new DefaultInteractionResolver('secret')
    ],
    [],
    null,
    new HitRegionInitializer(
        new HitRegionFilter(['secret'], ['Image'])
    ),
    new Intersection(
        [
            new VisibilityValidator(),
            new CategoryValidator(['secret'])
        ]
    )
);
let stage = kiigame.stage;
let texts_json = kiigame.texts_json;

var legends_json = JSON.parse(new JSONGetter().getJSON('legends.json'));

stage.find("#locker_room_1")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
stage.find("#locker_room_2")[0].setSize(stage.getWidth(), stage.getHeight() - 100);

var input_text = stage.find('#input_text')[0];
var input_layer = stage.find('#input_layer')[0];

//For checking whether player has selected their jersey number
var number_selected = false;

// Default player number
input_text.setText(texts_json['input_text']['text']);

// Dirty removing of default event handler to allow using jersey input
stage.find('#start_game')[0].eventListeners.click = [];

// On clicking the start game we open the choosing the jersey number
stage.find('#start_game')[0].on('tap click', function(event) {
	input_layer.show();
    // When default number is on, buttons shouldn't be grey when starting
    stage.find('#button_ok').show();
	stage.find('#button_ok_gray').hide();
	stage.find('#button_back').show();
	stage.find('#button_back_gray').hide();
	stage.find('#button_0').show();
	stage.find('#button_0_gray').hide();
	input_layer.draw();
	input_layer.moveToTop();
});

// Hidden feature, click the image on the start screen and get a funny reaction from the character
stage.find('#start')[0].on('tap click', function(event) {
	event = event.target;

	kiigame.setMonologue(kiigame.findMonologue('character_panic', 'text'));
    kiigame.playCharacterAnimation(kiigame.character_animations["panic"], 6000);
});

// Listeners for the input screen buttons
input_layer.on('tap click', function(event) {
	var target = event.target;
	
	var selected = texts_json[target.getAttr('id')];
	if (selected)
	    selected = selected.name;
	else
	    return;
	
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
		stage.find('#jersey_number')[0].setText(input_text.getText());
		texts_json['jersey_number']['examine'] = texts_json['input_text']['wikistart'] + input_text.getText() + texts_json['input_text']['wikiend'] + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia;
		texts_json['icehockey_jersey']['examine'] = texts_json['input_text']['wikistart'] + input_text.getText() + texts_json['input_text']['wikiend'] + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia;
		input_layer.hide();

	    var intro_delay = kiigame.play_sequence("intro", true);
        setTimeout(() => kiigame.do_transition(kiigame.game_start_layer.id(), 0), intro_delay);
	}
	// If no number, grey out buttons that can't be used
	if (input_text.getText().length == 0) {
		stage.find('#button_ok').hide();
		stage.find('#button_ok_gray').show();
		stage.find('#button_back').hide();
		stage.find('#button_back_gray').show();
		stage.find('#button_0').hide();
		stage.find('#button_0_gray').show();
	} else {
		stage.find('#button_ok').show();
		stage.find('#button_ok_gray').hide();
		stage.find('#button_back').show();
		stage.find('#button_back_gray').hide();
		stage.find('#button_0').show();
		stage.find('#button_0_gray').hide();
	}
	input_layer.draw();

});

// When poster on the wall is clicked (the final step of the game), count rewards in invetory.
stage.find('#poster_onthewall')[0].on('tap click', function(event) {
    var rewards_text = kiigame.getObject("rewards_text");
    var rewardsCount = kiigame.inventory_layer.children.length;
    rewards_text.text(rewardsCount + rewards_text.text());
});

//Developer feature - shortcut menu from the empty menu button for testing purposes
kiigame.start_layer.on('mouseup touchend', function(event) {
	kiigame.handle_click(event);
});

stage.find('#start_empty')[0].on('tap click', function(event) {
	event = event.target;

	var oikotie = stage.find('#oikotie')[0];
	oikotie.x(50);
    oikotie.show();
	oikotie.moveTo(kiigame.start_layer);
    oikotie.on('click', function() {
        kiigame.menu.hide();
    });

    var oikotie2 = stage.find('#oikotie2')[0];
    oikotie2.x(200);
    oikotie2.show();
    oikotie2.moveTo(kiigame.start_layer);
	oikotie2.on('click', function() {
		kiigame.inventoryAdd(stage.find('#poster_withoutglue')[0]);
		kiigame.inventoryAdd(stage.find('#poster_withglue')[0]);
		kiigame.inventoryAdd(stage.find('#airfreshener')[0]);
		kiigame.inventoryAdd(stage.find('#cienibang')[0]);
        kiigame.menu.hide();
	});

	stage.draw();
});
