import { KiiGame } from './kiigame.js';
import DefaultInteractionResolver from './controller/interactions/DefaultInteractionResolver.js';
import HitRegionInitializer from './view/room/HitRegionInitializer.js';
import HitRegionFilter from './view/room/hitregion/HitRegionFilter.js';
import Intersection from './view/draggeditem/intersection/Intersection.js';
import VisibilityValidator from './view/draggeditem/intersection/VisibilityValidator.js';
import CategoryValidator from './view/draggeditem/intersection/CategoryValidator.js';
import { JSONGetter } from './util/JSONGetter.js';
import ImagePreparer from './viewbuilder/util/konva/ImagePreparer.js';
import { FurnitureBuilder } from './viewbuilder/room/konva/FurnitureBuilder.js';
import { SecretBuilder } from './latkazombit/viewbuilder/room/konva/SecretBuilder.js';
import CommandsHandler from './controller/interactions/CommandsHandler.js';
import { CommandHandler } from './controller/interactions/CommandHandler.js';
import { container, GameEventEmitter, UiEventEmitter } from './inversify.config.js';
import EventEmitter from './events/EventEmitter.js';
import { KonvaPointerEvent } from 'konva/types/PointerEvents.js';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node.js';

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
    rooms_json: rooms_json,
    character_json: character_json,
    sequences_json: sequences_json,
    items_json: items_json,
    startInteraction: 'begin'
};

const gameEventEmitter: EventEmitter = container.get(GameEventEmitter);
const uiEventEmitter: EventEmitter = container.get(UiEventEmitter);

const kiigame = new KiiGame(
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
        new HitRegionFilter(['secret'], ['Image']),
        uiEventEmitter
    ),
    new Intersection(
        [
            new VisibilityValidator(),
            new CategoryValidator(['secret'])
        ]
    ),
    {
        furniture: {
            roomChildrenTypeBuilder: new FurnitureBuilder()
        },
        secret: {
            roomChildrenTypeBuilder: new SecretBuilder()
        }
    },
    gameEventEmitter,
    uiEventEmitter,
    gameData,
);
// TODO: "as any" hacks around "Property 'getWidth' does not exist on type 'Stage'.ts"
const stage = kiigame.getStage() as any;

const legends_json = JSON.parse(jsonGetter.getJSON('data/legends.json'));

// Fix these backgrounds being in the wrong size in relation to the stage & other backgrounds
stage.find("#locker_room_1")[0].setSize(stage.getWidth(), stage.getHeight() - 100);
stage.find("#locker_room_2")[0].setSize(stage.getWidth(), stage.getHeight() - 100);

const input_text = stage.find('#input_text')[0];
const input_layer = stage.find('#input_layer')[0];
new ImagePreparer(kiigame.getStageObjectGetter()).prepareImages(input_layer);

// For checking whether player has selected their jersey number
let number_selected = false;

// Default player number
input_text.setText(kiigame.getText().getText('input_text', 'text'));

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
input_layer.on('tap click', (event: KonvaEventObject<KonvaPointerEvent>) => {
    const target = event.target;

    const selected = kiigame.getText().getName(target.getAttr('id'));
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
        kiigame.getText().setText('jersey_number', 'examine', kiigame.getText().getText('input_text', 'wikistart') + input_text.getText() + kiigame.getText().getText('input_text', 'wikiend') + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia);
        kiigame.getText().setText('icehockey_jersey', 'examine', kiigame.getText().getText('input_text', 'wikistart') + input_text.getText() + kiigame.getText().getText('input_text', 'wikiend') + legends_json[parseInt(input_text.getText()) - 1].player + ".\n\n" + legends_json[parseInt(input_text.getText()) - 1].wikipedia);
        input_layer.hide();

        new CommandsHandler(
            new CommandHandler(
                gameEventEmitter,
                uiEventEmitter,
                kiigame.getStageObjectGetter(),
                kiigame.getText(),
                items_json
            )
        ).handleCommands(new DefaultInteractionResolver().resolveCommands(
            kiigame.getInteractions(),
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

// When arriving to the final room (the final step of the game), count rewards in invetory.
uiEventEmitter.on('arrived_in_room', function (roomId: string) {
    if (roomId === 'end_layer') {
        const rewards_text = kiigame.getStageObjectGetter().getObject("rewards_text") as Konva.Text;
        let rewardsCount = 0;
        for (const inventoryItem of kiigame.getInventory().items) {
            if (inventoryItem.category === 'reward') {
                rewardsCount++;
            }
        }
        rewards_text.text(rewardsCount + rewards_text.text());
        rewards_text.clearCache();
        stage.draw();
    }
});
