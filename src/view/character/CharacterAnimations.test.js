import { expect, use } from 'chai';
import { createStubInstance, restore, stub } from 'sinon';
import sinonChai from "sinon-chai";
import { EventEmitter } from '../../events/EventEmitter.js';
import pkg from 'konva';
import CharacterAnimations from './CharacterAnimations.js';
const { Tween, Node } = pkg;
use(sinonChai);

describe('character animations tests', () => {
    let animations;
    let uiEventEmitterStub;
    let gameEventEmitterStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        gameEventEmitterStub = createStubInstance(EventEmitter);
        animations = {
            'some_animation': [
                createStubInstance(Tween),
                createStubInstance(Tween)
            ],
            'idle': [
                createStubInstance(Tween),
                createStubInstance(Tween)
            ]
        };
    });
    afterEach(() => {
        restore();
    });
    // TODO: cover play character animation
    // TODO: cover play character speak animation
    describe('reset character animations', () => {
        it('should reset character animations to idle on clicked_on_stage', () => {
            const characterAnimations = new CharacterAnimations(animations, uiEventEmitterStub, gameEventEmitterStub);
            // Stub helper functions to make unit testing a little bit easier
            const resetAnimationFrameStub = stub(characterAnimations, 'resetAnimationFrame');
            const playAnimationFrameStub = stub(characterAnimations, 'playAnimationFrame');
            const resetCharacterAnimationsCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'clicked_on_stage';
            }).args[1];
            resetCharacterAnimationsCallback();

            // A little bit silly replication of the code structure in the implementation ...
            Object.values(animations).forEach((frames) => {
                frames.forEach((frame) => {
                    expect(resetAnimationFrameStub).to.have.been.calledWith(frame);
                });
            });
            expect(playAnimationFrameStub).to.have.been.calledWith(animations['idle'][0]);
            expect(uiEventEmitterStub.emit).to.have.been.calledWith('character_animation_started');
        });
    });
    describe('test resetAnimationFrame helper function separately', () => {
        it('should reset a single animation frame', () => {
            const characterAnimations = new CharacterAnimations(animations, uiEventEmitterStub, gameEventEmitterStub);
            const parentNodeStub = createStubInstance(Node);
            animations['some_animation'][0].node = parentNodeStub;
            characterAnimations.resetAnimationFrame(animations['some_animation'][0]);
            expect(parentNodeStub.hide).to.have.been.called;
            expect(animations['some_animation'][0].reset).to.have.been.called;
        });
    });
    describe('test playAnimationFrame helper function separately', () => {
        it('should play a single animation frame', () => {
            const characterAnimations = new CharacterAnimations(animations, uiEventEmitterStub, gameEventEmitterStub);
            const parentNodeStub = createStubInstance(Node);
            animations['some_animation'][0].node = parentNodeStub;
            characterAnimations.playAnimationFrame(animations['some_animation'][0]);
            expect(parentNodeStub.show).to.have.been.called;
            expect(animations['some_animation'][0].play).to.have.been.called;
        });
    });
    describe('test setIdleAnimation', () => {
        it('should set idle animation name', () => {
            const characterAnimations = new CharacterAnimations(animations, uiEventEmitterStub, gameEventEmitterStub);
            // Stub helper functions to make unit testing a little bit easier
            const resetAnimationFrameStub = stub(characterAnimations, 'resetAnimationFrame');
            const playAnimationFrameStub = stub(characterAnimations, 'playAnimationFrame');
            const setIdleAnimationCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'set_idle_animation';
            }).args[1];
            setIdleAnimationCallback('some_animation');

            // A little bit silly replication of the code structure in the implementation ...
            Object.values(animations).forEach((frames) => {
                frames.forEach((frame) => {
                    expect(resetAnimationFrameStub).to.have.been.calledWith(frame);
                });
            });
            expect(playAnimationFrameStub).to.have.been.calledWith(animations['some_animation'][0]);
            expect(uiEventEmitterStub.emit).to.have.been.calledWith('character_animation_started');

            expect(characterAnimations.idleAnimationName).to.equal('some_animation');
        });
    });
    describe('test setSpeakAnimation', () => {
        it('should set speak animation name', () => {
            const characterAnimations = new CharacterAnimations(animations, uiEventEmitterStub, gameEventEmitterStub);
            // Stub helper functions to make unit testing a little bit easier
            const resetAnimationFrameStub = stub(characterAnimations, 'resetAnimationFrame');
            const playAnimationFrameStub = stub(characterAnimations, 'playAnimationFrame');
            const setSpeakAnimationCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'set_speak_animation';
            }).args[1];
            setSpeakAnimationCallback('some_animation');

            // A little bit silly replication of the code structure in the implementation ...
            Object.values(animations).forEach((frames) => {
                frames.forEach((frame) => {
                    expect(resetAnimationFrameStub).to.have.been.calledWith(frame);
                });
            });
            expect(playAnimationFrameStub).to.have.been.calledWith(animations['idle'][0]);
            expect(uiEventEmitterStub.emit).to.have.been.calledWith('character_animation_started');

            expect(characterAnimations.speakAnimationName).to.equal('some_animation');
        });
    });
});
