import { KiiGame } from './kiigame.js';
import DefaultInteractionResolver from './model/DefaultInteractionResolver.js';
import HitRegionInitializer from './view/stage/HitRegionInitializer.js';
import HitRegionFilter from './view/stage/hitregion/HitRegionFilter.js';
import Intersection from './view/Intersection.js';
import VisibilityValidator from './view/intersection/VisibilityValidator.js';
import CategoryValidator from './view/intersection/CategoryValidator.js';
import JSONGetter from './util/JSONGetter.js';
import EventEmitter from './events/EventEmitter.js';

const jsonGetter = new JSONGetter();

// Get jsons from the server
const interactions_json = JSON.parse(jsonGetter.getJSON('data/interactions.json'));
const music_json = JSON.parse(jsonGetter.getJSON('data/music.json'));
const text_json = JSON.parse(jsonGetter.getJSON('data/texts.json'));
const layersJson = JSON.parse(jsonGetter.getJSON('data/layers.json'));
const rooms_json = JSON.parse(jsonGetter.getJSON('data/rooms.json'));
const character_json = JSON.parse(jsonGetter.getJSON('data/character.json'));
const sequences_json = JSON.parse(jsonGetter.getJSON('data/sequences.json'));
const items_json = JSON.parse(jsonGetter.getJSON('data/items.json'));

const gameData = {
    interactions_json: interactions_json,
    music_json: music_json,
    text_json: text_json,
    layersJson: layersJson,
    rooms_json: rooms_json['rooms'],
    character_json: character_json,
    sequences_json: sequences_json,
    items_json: items_json,
    startInteraction: 'begin'
};

const gameEventEmitter = new EventEmitter();
const uiEventEmitter = new EventEmitter();

const kiigame = new KiiGame(
    undefined,
    undefined,
    [
        new DefaultInteractionResolver('item'),
        new DefaultInteractionResolver('furniture'),
        new DefaultInteractionResolver('reward'),
        new DefaultInteractionResolver('secret')
    ],
    [
        new DefaultInteractionResolver('item'),
        new DefaultInteractionResolver('furniture'),
        new DefaultInteractionResolver('reward')
    ],
    new HitRegionInitializer(
        new HitRegionFilter(['secret'], ['Image'])
    ),
    new Intersection(
        [
            new VisibilityValidator(),
            new CategoryValidator(['secret'])
        ]
    ),
    gameEventEmitter,
    uiEventEmitter,
    gameData,
);
const stage = kiigame.stage;

const legends_json = JSON.parse(jsonGetter.getJSON('data/legends.json'));

// Fix these backgrounds being in the wrong size in relation to the stage & other backgrounds
stage.find("#locker_room_1")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
stage.find("#locker_room_2")[0].setSize(stage.getWidth(), stage.getHeight() - 100);

const input_text = stage.find('#input_text')[0];
const input_layer = stage.find('#input_layer')[0];

// For checking whether player has selected their jersey number
let number_selected = false;

// Default player number
input_text.setText(kiigame.text.getText('input_text', 'text'));

// On clicking the start game we open the choosing the jersey number
stage.find('#start_game')[0].on('tap click', function () {
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

// Listeners for the input screen buttons
input_layer.on('tap click', function (event) {
    const target = event.target;

    const selected = kiigame.text.getName(target.getAttr('id'));
    if (!selected) {
        return;
    }

    if (parseInt(selected) >= 0 && parseInt(selected) <= 9) {
        // Number buttons
        switch (parseInt(selected)) {
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
    } else if (selected == 'Pyyhi') {
        // Backspace
        if (input_text.getText().length > 0) {
            input_text.setText(input_text.getText().slice(0, -1));
        }
    } else if (selected == 'OK' && input_text.getText().length > 0) {
        // OK
        stage.find('#jersey_number')[0].setText(input_text.getText());
        kiigame.text.setText('jersey_number', 'examine', kiigame.text.getText('input_text', 'wikistart') + input_text.getText() + kiigame.text.getText('input_text', 'wikiend') + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia);
        kiigame.text.setText('icehockey_jersey', 'examine', kiigame.text.getText('input_text', 'wikistart') + input_text.getText() + kiigame.text.getText('input_text', 'wikiend') + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia);
        input_layer.hide();

        kiigame.handle_commands(new DefaultInteractionResolver().resolveCommands(
            kiigame.interactions,
            'start_button_ok'
        ));
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

// Easter egg, click the image on the start screen and get a funny reaction from the character
stage.find('#start')[0].on('tap click', function () {
    gameEventEmitter.emit('monologue', kiigame.text.getText('character_panic', 'text'));
    uiEventEmitter.emit('play_character_animation', { animationName: "panic", duration: 6000 });
});

// When poster on the wall is clicked (the final step of the game), count rewards in invetory.
stage.find('#poster_onthewall')[0].on('tap click', function () {
    const rewards_text = kiigame.getObject("rewards_text");
    let rewardsCount = 0;
    for (const inventoryItem of kiigame.inventory_layer.children) {
        if (inventoryItem.getAttr('category') === 'reward') {
            rewardsCount++;
        }
    }
    rewards_text.text(rewardsCount + rewards_text.text());
});
