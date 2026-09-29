import { assert } from 'chai';
import { spy } from 'sinon';
import { EventEmitter } from './EventEmitter';

const makeEmitter = () => {
  const debugSpy = spy();

  return {
    emitter: new EventEmitter({ debug: debugSpy }),
    debugSpy,
  };
};

describe('EventEmitter', () => {
  it('should call listener when event is emitted', () => {
    const { emitter } = makeEmitter();
    const callbackSpy = spy();
    emitter.on('event', callbackSpy);
    emitter.emit('event', 'data');
    assert.isTrue(callbackSpy.calledOnceWith('data'));
  });

  it('should call listener without data if data is not provided', () => {
    const { emitter } = makeEmitter();
    const callbackSpy = spy();
    emitter.on('event', callbackSpy);
    emitter.emit('event');
    assert.isTrue(callbackSpy.calledOnceWith(undefined));
  });

  it('should call all listeners for an event', () => {
    const { emitter } = makeEmitter();
    const callbackSpy1 = spy();
    const callbackSpy2 = spy();
    emitter.on('event', callbackSpy1);
    emitter.on('event', callbackSpy2);
    emitter.emit('event', 'data');
    assert.isTrue(callbackSpy1.calledOnceWith('data'));
    assert.isTrue(callbackSpy2.calledOnceWith('data'));
  });

  it('should not fail if emitting an event with no listeners', () => {
    const { emitter } = makeEmitter();
    assert.doesNotThrow(() => emitter.emit('non_event', 'data'));
  });

  it('should log debug message if no listeners for event', () => {
    const { emitter, debugSpy } = makeEmitter();
    emitter.emit('non_event', 'data');
    assert.isTrue(debugSpy.calledOnce);
    assert.strictEqual(debugSpy.firstCall.args[0], 'No listeners for event: non_event');
  });

  it('should not call listeners for other events', () => {
    const { emitter } = makeEmitter();
    const callbackSpy = spy();
    emitter.on('event_a', callbackSpy);
    emitter.emit('event_b', 'data');
    assert.isTrue(callbackSpy.notCalled);
  });
});
