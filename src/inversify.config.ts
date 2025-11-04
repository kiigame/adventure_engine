import { decorate, injectable, inject, Container } from "inversify";
import SlideBuilder from "./viewbuilder/sequence/konva/SlideBuilder.js";
import TextBuilder from "./viewbuilder/sequence/konva/TextBuilder.js";
import SequenceBuilder from "./viewbuilder/sequence/konva/SequenceBuilder.js";
import ItemBuilder from "./viewbuilder/item/konva/ItemBuilder.js";
import ItemsBuilder from "./viewbuilder/item/konva/ItemsBuilder.js";
import EventEmitter from "./events/EventEmitter.js";

export const GameEventEmitter: symbol = Symbol.for("GameEventEmitter");
export const UiEventEmitter: symbol = Symbol.for("UIEventEmitter");

decorate(injectable(), TextBuilder);
decorate(injectable(), SlideBuilder);
decorate(injectable(), SequenceBuilder);

decorate(injectable(), ItemBuilder);
decorate(injectable(), ItemsBuilder);

decorate(injectable(), EventEmitter);

decorate(inject(TextBuilder), SlideBuilder, 0);
decorate(inject(SlideBuilder), SequenceBuilder, 0);

decorate(inject(ItemBuilder), ItemsBuilder, 0);

const container = new Container();
container.bind<TextBuilder>(TextBuilder).to(TextBuilder);
container.bind<SlideBuilder>(SlideBuilder).to(SlideBuilder);
container.bind<SequenceBuilder>(SequenceBuilder).to(SequenceBuilder);
container.bind<ItemBuilder>(ItemBuilder).to(ItemBuilder);
container.bind<ItemsBuilder>(ItemsBuilder).to(ItemsBuilder);

// Bind EventEmitter instances as singletons
container.bind<EventEmitter>(GameEventEmitter).to(EventEmitter).inSingletonScope();
container.bind<EventEmitter>(UiEventEmitter).to(EventEmitter).inSingletonScope();

export { container };
