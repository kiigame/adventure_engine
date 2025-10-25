import CommandHandler from "./CommandHandler.js";

class CommandsHandler {
    /**
     * @param {CommandHandler} commandHandler 
     */
    constructor(commandHandler) {
        this.commandHandler = commandHandler;
    }

    /**
     * Loop through a list of interaction commands and execute them with CommandHandler,
     * with timeout if specified
     * @param {object} commands a list of interaction commands list as json
     */
    handleCommands(commands) {
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

export default CommandsHandler;
