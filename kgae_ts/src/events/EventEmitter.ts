export class EventEmitter {
  private listeners: Map<string, CallableFunction[]>;
  private logger: Pick<Console, 'debug'>;

  constructor(logger: Pick<Console, 'debug'> = console) {
    this.listeners = new Map();
    this.logger = logger;
  }

  on(eventName: string, callback: CallableFunction) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)?.push(callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(eventName: string, data: any = undefined) {
    const callbacks = this.listeners.get(eventName);
    if (!callbacks) {
      this.logger.debug(`No listeners for event: ${eventName}`);
      return;
    }
    callbacks.forEach(callback => callback(data));
  }
}
