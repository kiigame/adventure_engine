import { expect } from 'chai';
import { spy, restore } from 'sinon';
import { EventEmitter } from './EventEmitter.js';

describe('EventEmitter', () => {
    let emitter;
    let loggerSpy;

    beforeEach(() => {
        loggerSpy = { debug: spy() };
        emitter = new EventEmitter(loggerSpy);
    });

    afterEach(() => {
        restore();
    });

    it('should call listener when event is emitted', () => {
        const callbackSpy = spy();
        emitter.on('event', callbackSpy);
        emitter.emit('event', 'data');
        expect(callbackSpy.calledOnceWith('data')).to.be.true;
    });

    it('should call listener without data if data is not provided', () => {
        const callbackSpy = spy();
        emitter.on('event', callbackSpy);
        emitter.emit('event');
        expect(callbackSpy.calledOnceWith(undefined)).to.be.true;
    });

    it('should call all listeners for an event', () => {
        const callbackSpy1 = spy();
        const callbackSpy2 = spy();
        emitter.on('event', callbackSpy1);
        emitter.on('event', callbackSpy2);
        emitter.emit('event', 'data');
        expect(callbackSpy1.calledOnceWith('data')).to.be.true;
        expect(callbackSpy2.calledOnceWith('data')).to.be.true;
    });

    it('should not fail if emitting an event with no listeners', () => {
        expect(() => emitter.emit('non_event', 'data')).to.not.throw();
    });

    it('should log debug message if no listeners for event', () => {
        emitter.emit('non_event', 'data');
        expect(loggerSpy.debug.calledOnce).to.be.true;
        expect(loggerSpy.debug.firstCall.args[0]).to.equal('No listeners for event: non_event');
    });

    it('should not call listeners for other events', () => {
        const callbackSpy = spy();
        emitter.on('event_a', callbackSpy);
        emitter.emit('event_b', 'data');
        expect(callbackSpy.notCalled).to.be.true;
    });
});
