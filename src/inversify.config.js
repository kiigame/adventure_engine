import { decorate, injectable, inject, Container } from "inversify";
import SlideBuilder from "./viewbuilder/sequence/konva/SlideBuilder.js";
import TextBuilder from "./viewbuilder/sequence/konva/TextBuilder.js";

export const TYPES = {
    TextBuilder: "TextBuilder",
    SlideBuilder: "SlideBuilder",
  };

decorate(injectable(), TextBuilder);
decorate(injectable(), SlideBuilder);

decorate(inject(TYPES.TextBuilder), SlideBuilder, 0);

const container = new Container();
container.bind(TYPES.TextBuilder).to(TextBuilder);
container.bind(TYPES.SlideBuilder).to(SlideBuilder);

export { container };
