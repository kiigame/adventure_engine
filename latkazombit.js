var legends_json = JSON.parse(getJSON('legends.json'));

stage.get("#locker_room_1")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
stage.get("#locker_room_2")[0].setSize(stage.getWidth(), stage.getHeight() - 100);

var input_text = stage.get('#input_text')[0];
var input_layer = stage.get('#input_layer')[0];

//For checking whether player has selected their jersey number
var number_selected = false;

// Default player number
input_text.setText(texts_json['input_text']['text']);

// Dirty removing of default event handler to allow using jersey input
stage.get('#start_game')[0].eventListeners.click = [];

// On clicking the start game we open the choosing the jersey number
stage.get('#start_game')[0].on('tap click', function(event) {
	input_layer.show();
    // When default number is on, buttons shouldn't be grey when starting
    stage.get('#button_ok').show();
	stage.get('#button_ok_gray').hide();
	stage.get('#button_back').show();
	stage.get('#button_back_gray').hide();
	stage.get('#button_0').show();
	stage.get('#button_0_gray').hide();
	input_layer.draw();
	input_layer.moveToTop();
});

// Hidden feature, click the image on the start screen and get a funny reaction from the character
stage.get('#start')[0].on('tap click', function(event) {
	event = event.target;

	setMonologue(findMonologue('character_panic', 'text'));
    playCharacterAnimation(character_animations["panic"], 6000);
});

// Listeners for the input screen buttons
input_layer.on('tap click', function(event) {
	target = event.target;
	
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
		stage.get('#jersey_number')[0].setText(input_text.getText());
		texts_json['jersey_number']['examine'] = texts_json['input_text']['wikistart'] + input_text.getText() + texts_json['input_text']['wikiend'] + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia;
		texts_json['icehockey_jersey']['examine'] = texts_json['input_text']['wikistart'] + input_text.getText() + texts_json['input_text']['wikiend'] + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia;
		input_layer.hide();

	    var intro_delay = play_sequence("intro", true);
        setTimeout('do_transition(game_start_layer.id(), 0)', intro_delay);
	}
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

//Developer feature - shortcut menu from the empty menu button for testing purposes
start_layer.on('mouseup touchend', function(event) {
	handle_click(event);
});

stage.get('#start_empty')[0].on('tap click', function(event) {
	event = event.target;

	var oikotie = stage.get('#oikotie')[0];
	oikotie.x(50);
    oikotie.show();
	oikotie.moveTo(start_layer);
    oikotie.on('click', function() {
        menu.hide();
    });

    var oikotie2 = stage.get('#oikotie2')[0];
    oikotie2.x(200);
    oikotie2.show();
    oikotie2.moveTo(start_layer);
	oikotie2.on('click', function() {
		inventoryAdd(stage.get('#poster_withoutglue')[0]);
		inventoryAdd(stage.get('#poster_withglue')[0]);
		inventoryAdd(stage.get('#airfreshener')[0]);
		inventoryAdd(stage.get('#cienibang')[0]);
        menu.hide();
	});

	stage.draw();
});
