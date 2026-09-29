import { Container, ContainerModule, decorate, inject, injectable } from "inversify";
import SlideBuilder from "./viewbuilder/sequence/konva/SlideBuilder.js";
import TextBuilder from "./viewbuilder/sequence/konva/TextBuilder.js";
import SequenceBuilder from "./viewbuilder/sequence/konva/SequenceBuilder.js";
import ItemBuilder from "./viewbuilder/item/konva/ItemBuilder.js";
import ItemsBuilder from "./viewbuilder/item/konva/ItemsBuilder.js";
import { EventEmitter, gameStateEngineModule } from "@kiigame/kgae_ts";

export { GameEventEmitter } from "@kiigame/kgae_ts";
export const UiEventEmitter: symbol = Symbol.for("UIEventEmitter");

decorate(injectable(), TextBuilder);
decorate(injectable(), SlideBuilder);
decorate(injectable(), SequenceBuilder);

decorate(injectable(), ItemBuilder);
decorate(injectable(), ItemsBuilder);

decorate(inject(TextBuilder), SlideBuilder, 0);
decorate(inject(SlideBuilder), SequenceBuilder, 0);

decorate(inject(ItemBuilder), ItemsBuilder, 0);

export const engineContainerModule = new ContainerModule(({ bind }) => {
  bind<TextBuilder>(TextBuilder).to(TextBuilder);
  bind<SlideBuilder>(SlideBuilder).to(SlideBuilder);
  bind<SequenceBuilder>(SequenceBuilder).to(SequenceBuilder);
  bind<ItemBuilder>(ItemBuilder).to(ItemBuilder);
  bind<ItemsBuilder>(ItemsBuilder).to(ItemsBuilder);
  bind<EventEmitter>(UiEventEmitter).to(EventEmitter).inSingletonScope();
});

const container = new Container();
container.load(gameStateEngineModule, engineContainerModule);

export { container };
