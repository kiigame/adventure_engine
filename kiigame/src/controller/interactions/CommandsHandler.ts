import { CommandHandler } from "./CommandHandler.js";

export class CommandsHandler {
    private commandHandler: CommandHandler;

    /**
     * @param {CommandHandler} commandHandler 
     */
    constructor(commandHandler: CommandHandler) {
        this.commandHandler = commandHandler;
    }

    /**
     * Loop through a list of interaction commands and execute them with CommandHandler,
     * with timeout if specified
     * @param {{ [key: string]: any }} commands a list of interaction commands list as json
     */
    handleCommands(commands: { [key: string]: any }) {
        for (const i in commands) {
            if (commands[i].timeout != null) {
                ((commands, i) => {
                    setTimeout(() => {
                        this.commandHandler.handleCommand(commands[i]);
                    }, commands[i].timeout);
                })(commands, i);
            } else {
                this.commandHandler.handleCommand(commands[i]);
            }
        }
    }

}
