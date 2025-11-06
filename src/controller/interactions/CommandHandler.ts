import { StageObjectGetter } from "../../util/konva/StageObjectGetter.js";
import EventEmitter from "../../events/EventEmitter.js";
import { Text } from "../../model/Text.js";

export class CommandHandler {
    private gameEventEmitter: EventEmitter;
    private uiEventEmitter: EventEmitter;
    private stageObjectGetter: StageObjectGetter;
    private text: Text;
    private itemsJson: { [key: string]: any };

    /**
     * @param {EventEmitter} gameEventEmitter
     * @param {EventEmitter} uiEventEmitter
     * @param {StageObjectGetter} stageObjectGetter
     * @param {Text} text
     * @param {{ [key: string]: any }} itemsJson
     */
    constructor(
        gameEventEmitter: EventEmitter,
        uiEventEmitter: EventEmitter,
        stageObjectGetter: StageObjectGetter,
        text: Text,
        itemsJson: { [key: string]: any }
    ) {
        this.gameEventEmitter = gameEventEmitter;
        this.uiEventEmitter = uiEventEmitter;
        this.stageObjectGetter = stageObjectGetter;
        this.text = text;
        this.itemsJson = itemsJson;
    }

    /**
     * Handle each interaction. Check what command is coming in, and do the thing.
     * Timeouts are done in handle_commands. Order of commands in interactions.json
     * can be important: for instance, monologue plays the speaking animation, so
     * play_character_animation should come after it, so that the speaking
     * animation is stopped and the defined animation plays, and not vice versa.
     * @param {object} command the interaction command as json
     */
    handleCommand(command: any) {
        if (command.command == "monologue") {
            const text = this.text.getText(command.textkey.object, command.textkey.string);
            this.gameEventEmitter.emit('monologue', text);
        } else if (command.command == "inventory_add") {
            const items = Array.isArray(command.item) ? command.item : [command.item];
            type itemToAdd = { name: string, category: string };
            const itemsToAdd: itemToAdd[] = [];
            items.forEach((name: string) =>
                itemsToAdd.push({ name, category: this.itemsJson[name].category })
            );
            this.gameEventEmitter.emit('inventory_add', itemsToAdd);
        } else if (command.command == "inventory_remove") {
            const items = Array.isArray(command.item) ? command.item : [command.item];
            const itemsToRemove: string[] = [];
            items.forEach((name: string) =>
                itemsToRemove.push(name)
            );
            this.gameEventEmitter.emit('inventory_remove', itemsToRemove);
        } else if (command.command == "remove_object") {
            const objects = Array.isArray(command.object) ? command.object : [command.object];
            const objectsToRemove: string[] = [];
            objects.forEach((objectName: string) => {
                objectsToRemove.push(objectName)
            });
            this.gameEventEmitter.emit('remove_objects', objectsToRemove);
        } else if (command.command == "add_object") {
            const objects = Array.isArray(command.object) ? command.object : [command.object];
            const objectsToAdd: string[] = [];
            objects.forEach((objectName: string) => {
                objectsToAdd.push(objectName)
            });
            this.gameEventEmitter.emit('add_objects', objectsToAdd);
        } else if (command.command == "do_transition") {
            this.uiEventEmitter.emit('ready_transition', ({
                type: command.instant ? 'instant' : 'regular',
                roomId: command.destination
            }));
            this.gameEventEmitter.emit('do_transition', {
                roomId: command.destination
            });
        } else if (command.command == "play_sequence") {
            this.gameEventEmitter.emit('play_sequence', command.sequence);
        } else if (command.command == "set_idle_animation") {
            this.gameEventEmitter.emit('set_idle_animation', command.animation);
        } else if (command.command == "set_speak_animation") {
            this.gameEventEmitter.emit('set_speak_animation', command.animation);
        } else if (command.command == "npc_monologue") {
            const npc = this.stageObjectGetter.getObject(command.npc);
            const text = this.text.getText(command.textkey.object, command.textkey.string);
            this.gameEventEmitter.emit('npc_monologue', { npc, text });
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
        } else {
            console.warn("Unknown interaction command " + command.command);
        }
    }
}
