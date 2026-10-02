import { assert } from 'chai';
import { createStubInstance, useFakeTimers, stub, restore } from 'sinon';
import { Music } from './Music';
import { AudioFactory } from './AudioFactory';
import { EventEmitter } from "@kiigame/kgae_ts";

class AudioStub {
    play() { return; };
    pause() { return; };
};

describe('test Music methods', function () {
    let uiEventEmitterStub;
    let audioFactoryStub;
    let audioStubStub;

    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        audioFactoryStub = createStubInstance(AudioFactory);
        audioStubStub = createStubInstance(AudioStub, { play: null, pause: null });
        audioFactoryStub.create.returns(audioStubStub);
    });
    afterEach(() => {
        restore();
    });
    it('calling play for undefined music does play music or crash', function () {
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
        music.playMusic(undefined);
        assert(audioStubStub.play.notCalled);
    });
    it('calling play for undefined music when playing by id lets previous audio keep playing', function () {
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
        music.playMusicById("layer");
        assert(audioStubStub.play.called, "play not called for first music");
        const audioStubStubNotToBeCreated = createStubInstance(AudioStub, { play: null, pause: null });
        music.playMusicById(undefined);
        assert(audioStubStubNotToBeCreated.play.notCalled, "play called for second music");
        assert(audioStubStub.pause.notCalled, "pause called for first music");
    });
    it('starting music without loop data will not have loop', function () {
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
        music.playMusicById('layer');
        assert.isNotNull(audioStubStub);
        assert.isFalse(audioStubStub.loop);
    });
    it('in two subsequent rooms with same music, respect if the second room implicitly sets looping to false', function () {
        const json = {
            "loop": {
                "music": "music.ogg",
                "loop": true,
            },
            "noloop": {
                "music": "music.ogg"
            }
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
        music.playMusicById('loop');
        assert(audioStubStub.play.called);
        const audioStubStubNotToBeCreated = createStubInstance(AudioStub, { play: null, pause: null });
        audioFactoryStub.create.returns(audioStubStubNotToBeCreated);
        music.playMusicById('noloop');
        assert(audioStubStubNotToBeCreated.play.notCalled);
        assert.isFalse(audioStubStub.loop);
    });
    it('in two subsequent rooms with same music, respect if the second room explicitly sets looping to false', function () {
        const json = {
            "loop": {
                "music": "music.ogg",
                "loop": true,
            },
            "noloop": {
                "music": "music.ogg",
                "loop": false
            }
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
        music.playMusicById('loop');
        assert(audioStubStub.play.called);
        const audioStubStubNotToBeCreated = createStubInstance(AudioStub, { play: null, pause: null });
        audioFactoryStub.create.returns(audioStubStubNotToBeCreated);
        music.playMusicById('noloop');
        assert(audioStubStubNotToBeCreated.play.notCalled);
        assert.isFalse(audioStubStub.loop);
    });
    describe('fades', function () {
        let clock;
        before(function () {
            clock = useFakeTimers();
        });
        after(function () {
            clock.tick(100000); // so that mocha doesn't wait for the interval to resolve
            clock.restore();
        });
        it('starting music with fade_in will have volume at 0 in the beginning, and grow volume', function () {
            const json = {
                "layer": {
                    "music": "music.ogg",
                    "fade_in": true,
                },
            };
            const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
            music.playMusicById('layer');
            assert(audioStubStub.play.called);
            // Test that volume starts at zero when fading in
            assert.deepEqual(audioStubStub.volume, 0);
            // Test that volume grows as expected when fading in
            clock.tick(200);
            assert.deepEqual(audioStubStub.volume, 0.05);
        });
        it('starting music with no fade_in implicitly will have volume at 1 in the beginning', function() {
            const json = {
                "layer": {
                    "music": "music.ogg",
                },
            };
            const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
            music.playMusicById('layer');
            assert(audioStubStub.play.called);
            assert.deepEqual(audioStubStub.volume, 1);
        });
        it('starting music with no fade_in explicitly will have volume at 1 in the beginning', function() {
            const json = {
                "layer": {
                    "music": "music.ogg",
                    "fade_in": false,
                },
            };
            const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
            music.playMusicById('layer');
            assert(audioStubStub.play.called);
            assert.deepEqual(audioStubStub.volume, 1);
        });
    });
    // TODO: More test cases
});

/**
 * These tests stub the methods that are called by the callbacks and only test
 * that the event configuration is as expected. The actual functionality is
 * tested in 'test Music methods'.
 */
describe('test Music event management', function () {
    let uiEventEmitterStub;
    let audioFactoryStub;
    let audioStubStub;

    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        audioFactoryStub = createStubInstance(AudioFactory);
        audioStubStub = createStubInstance(AudioStub, { play: null, pause: null });
        audioFactoryStub.create.returns(audioStubStub);
    });
    afterEach(() => {
        restore();
    });
    it('should handle play_sequence_started event by calling playMusicById', function () {
        const playMusicByIdStub = stub(Music.prototype, 'playMusicById');
        new Music({}, audioFactoryStub, uiEventEmitterStub);
        const musicId = 'testId';
        const playMusicByIdCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
            return callback.args[0] === 'play_sequence_started';
        }).args[1];
        playMusicByIdCallback(musicId);
        assert.isTrue(playMusicByIdStub.calledOnceWith(musicId));
    });
    it('should handle arrived_in_room event by calling playMusicById', function () {
        const playMusicByIdStub = stub(Music.prototype, 'playMusicById');
        new Music({}, audioFactoryStub, uiEventEmitterStub);
        const roomId = 'testId';
        const playMusicByIdCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
            return callback.args[0] === 'arrived_in_room';
        }).args[1];
        playMusicByIdCallback(roomId);
        assert.isTrue(playMusicByIdStub.calledOnceWith(roomId));
    });
});
