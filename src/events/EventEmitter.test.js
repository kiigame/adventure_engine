import { expect } from 'chai';
import sinon from 'sinon';
import EventEmitter from './EventEmitter.js';

describe('EventEmitter', () => {
    let emitter;
    let loggerSpy;

    beforeEach(() => {
        loggerSpy = { debug: sinon.spy() };
        emitter = new EventEmitter(loggerSpy);
    });

    it('should call listener when event is emitted', () => {
        const spy = sinon.spy();
        emitter.on('event', spy);
        emitter.emit('event', 'data');
        expect(spy.calledOnceWith('data')).to.be.true;
    });

    it('should call all listeners for an event', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        emitter.on('event', spy1);
        emitter.on('event', spy2);
        emitter.emit('event', 'data');
        expect(spy1.calledOnceWith('data')).to.be.true;
        expect(spy2.calledOnceWith('data')).to.be.true;
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
        const spy = sinon.spy();
        emitter.on('event_a', spy);
        emitter.emit('event_b', 'data');
        expect(spy.notCalled).to.be.true;
    });
});