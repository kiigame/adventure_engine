import { decorate, injectable, inject, Container } from "inversify";
import SlideBuilder from "./viewbuilder/sequence/konva/SlideBuilder.js";
import TextBuilder from "./viewbuilder/sequence/konva/TextBuilder.js";
import EventEmitter from "./events/EventEmitter.js";

export const TYPES = {
    TextBuilder: "TextBuilder",
    SlideBuilder: "SlideBuilder",

    GameEventEmitter: Symbol.for("GameEventEmitter"),
    UiEventEmitter: Symbol.for("UIEventEmitter"),
    EventEmitter: "EventEmitter",
  };

decorate(injectable(), TextBuilder);
decorate(injectable(), SlideBuilder);

decorate(injectable(), EventEmitter);

decorate(inject(TYPES.TextBuilder), SlideBuilder, 0);

const container = new Container();
container.bind(TYPES.TextBuilder).to(TextBuilder);
container.bind(TYPES.SlideBuilder).to(SlideBuilder);

// Bind EventEmitter instances as singletons
container.bind(TYPES.GameEventEmitter).to(EventEmitter).inSingletonScope();
container.bind(TYPES.UiEventEmitter).to(EventEmitter).inSingletonScope();

export { container };
