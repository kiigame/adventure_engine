import { decorate, injectable, inject, Container } from "inversify";
import SlideBuilder from "./viewbuilder/sequence/konva/SlideBuilder.js";
import TextBuilder from "./viewbuilder/sequence/konva/TextBuilder.js";
import SequenceBuilder from "./viewbuilder/sequence/konva/SequenceBuilder.js";
import ItemBuilder from "./viewbuilder/item/konva/ItemBuilder.js";
import ItemsBuilder from "./viewbuilder/item/konva/ItemsBuilder.js";
import EventEmitter from "./events/EventEmitter.js";

export const TYPES = {
    TextBuilder: "TextBuilder",
    SlideBuilder: "SlideBuilder",
    SequenceBuilder: "SequenceBuilder",

    ItemBuilder: "ItemBuilder",
    ItemsBuilder: "ItemsBuilder",

    GameEventEmitter: Symbol.for("GameEventEmitter"),
    UiEventEmitter: Symbol.for("UIEventEmitter"),
    EventEmitter: "EventEmitter",
  };

decorate(injectable(), TextBuilder);
decorate(injectable(), SlideBuilder);
decorate(injectable(), SequenceBuilder);

decorate(injectable(), ItemBuilder);
decorate(injectable(), ItemsBuilder);

decorate(injectable(), EventEmitter);

decorate(inject(TYPES.TextBuilder), SlideBuilder, 0);
decorate(inject(TYPES.SlideBuilder), SequenceBuilder, 0);

decorate(inject(TYPES.ItemBuilder), ItemsBuilder, 0);

const container = new Container();
container.bind(TYPES.TextBuilder).to(TextBuilder);
container.bind(TYPES.SlideBuilder).to(SlideBuilder);
container.bind(TYPES.SequenceBuilder).to(SequenceBuilder);
container.bind(TYPES.ItemBuilder).to(ItemBuilder);
container.bind(TYPES.ItemsBuilder).to(ItemsBuilder);

// Bind EventEmitter instances as singletons
container.bind(TYPES.GameEventEmitter).to(EventEmitter).inSingletonScope();
container.bind(TYPES.UiEventEmitter).to(EventEmitter).inSingletonScope();

export { container };
