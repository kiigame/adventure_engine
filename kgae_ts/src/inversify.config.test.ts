import { expect } from "chai";
import { Container } from "inversify";
import { EventEmitter } from "./events/EventEmitter.js";
import { GameEventEmitter, gameStateEngineModule } from "./inversify.config.js";

describe("game event emitter module", () => {
    it("binds one singleton EventEmitter instance per container", () => {
        const container = new Container();
        container.load(gameStateEngineModule);

        const firstEmitter = container.get<EventEmitter>(GameEventEmitter);
        const secondEmitter = container.get<EventEmitter>(GameEventEmitter);

        expect(firstEmitter).to.be.instanceOf(EventEmitter);
        expect(secondEmitter).to.equal(firstEmitter);
    });
});