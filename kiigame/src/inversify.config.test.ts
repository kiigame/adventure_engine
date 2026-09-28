import { expect } from 'chai';
import { Container } from 'inversify';
import { EventEmitter } from './events/EventEmitter.js';
import { engineContainerModule, GameEventEmitter, UiEventEmitter } from './inversify.config.js';

describe('engine container module', () => {
  it('binds singleton game and UI emitters as separate instances', () => {
    const container = new Container();
    container.load(engineContainerModule);

    const gameEmitter = container.get<EventEmitter>(GameEventEmitter);
    const secondGameEmitter = container.get<EventEmitter>(GameEventEmitter);
    const uiEmitter = container.get<EventEmitter>(UiEventEmitter);

    expect(gameEmitter).to.be.instanceOf(EventEmitter);
    expect(secondGameEmitter).to.equal(gameEmitter);
    expect(uiEmitter).to.be.instanceOf(EventEmitter);
    expect(uiEmitter).not.to.equal(gameEmitter);
  });
});