class EventEmitter {
    constructor(logger = console) {
        this.listeners = new Map();
        this.logger = logger;
    }

    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
    }

    emit(eventName, data) {
        const callbacks = this.listeners.get(eventName);
        if (!callbacks) {
            this.logger.debug(`No listeners for event: ${eventName}`);
            return;
        }
        callbacks.forEach(callback => callback(data));
    }
}

export default EventEmitter;