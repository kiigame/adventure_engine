import { ContainerModule, decorate, injectable } from "inversify";
import { EventEmitter } from "./events/EventEmitter.js";

export const GameEventEmitter: symbol = Symbol.for("GameEventEmitter");

decorate(injectable(), EventEmitter);

export const gameStateEngineModule = new ContainerModule(({ bind }) => {
  bind<EventEmitter>(GameEventEmitter).to(EventEmitter).inSingletonScope();
});
