export class EventEmitter {
    private listeners: Map<string, CallableFunction[]>;
    private logger: Console;

    /**
     * @param {Console} logger
     */
    constructor(logger: Console = console) {
        this.listeners = new Map();
        this.logger = logger;
    }

    /**
     * @param {string} eventName
     * @param {CallableFunction} callback
     */
    on(eventName: string, callback: CallableFunction) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)?.push(callback);
    }

    /**
     * @param {string} eventName
     * @param {any} data
     */
    emit(eventName: string, data: any = undefined) {
        const callbacks = this.listeners.get(eventName);
        if (!callbacks) {
            this.logger.debug(`No listeners for event: ${eventName}`);
            return;
        }
        callbacks.forEach(callback => callback(data));
    }
}
