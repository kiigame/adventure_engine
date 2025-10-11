import { assert } from 'chai';
import { createStubInstance, useFakeTimers, stub } from 'sinon';
import Music from './Music.js';
import AudioFactory from './AudioFactory.js';
import EventEmitter from '../../events/EventEmitter.js';

const audioFactoryStub = createStubInstance(AudioFactory);
class AudioStub {
    play() { return; };
    pause() { return; };
};
const audioStubStub = createStubInstance(AudioStub, { play: null, pause: null });
audioFactoryStub.create.returns(audioStubStub);

describe('test Music methods', function () {
    let uiEventEmitterStub;
    let gameEventEmitterStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        gameEventEmitterStub = createStubInstance(EventEmitter, { on: () => null});
    });
    it('calling play for undefined music does play music or crash', function () {
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        music.playMusic(undefined);
        assert(audioStubStub.play.notCalled);
        const current_audio = music.current_audio;
        assert.deepEqual(current_audio, null);
    });
    it('calling play for undefined music when playing by id lets previous audio keep playing', function () {
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        music.playMusicById("layer");
        assert(audioStubStub.play.called, "play not called for first music");
        const current_audio = music.current_audio;
        assert.deepEqual(current_audio, audioStubStub);
        const audioStubStubNotToBeCreated = createStubInstance(AudioStub, { play: null, pause: null });
        music.playMusicById(undefined);
        assert(audioStubStubNotToBeCreated.play.notCalled, "play called for second music");
        assert(audioStubStub.pause.notCalled, "pause called for first music");
        const current_audio_after_second_call = music.current_audio;
        assert.deepEqual(current_audio_after_second_call, audioStubStub);
    });
    it('starting music without loop, fade_in or fade_out data will not have loop, fade_in or fade_out', function () {
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        music.playMusicById('layer');
        const result = music.current_audio;
        assert.isNotNull(result);
        assert.isFalse(result.loop);
        assert.isFalse(result.fade_in);
        assert.isFalse(result.fade_out);
        assert.deepEqual(result.volume, 1);
    });
    it('starting music with explicit false for loop, fade_in and fade_out in data will not fave loop, fade_in or fade_out', function () {
        const json = {
            "layer": {
                "music": "music.ogg",
                "fade_in": false,
                "fade_out": false,
                "loop": false,
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        music.playMusicById('layer');
        assert(audioStubStub.play.called);
        const result = music.current_audio;
        assert.isNotNull(result);
        assert.isFalse(result.loop);
        assert.isFalse(result.fade_in);
        assert.isFalse(result.fade_out);
        assert.deepEqual(result.volume, 1);
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
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        music.playMusicById('loop');
        assert(audioStubStub.play.called);
        const audioStubStubNotToBeCreated = createStubInstance(AudioStub, { play: null, pause: null });
        audioFactoryStub.create.returns(audioStubStubNotToBeCreated);
        music.playMusicById('noloop');
        assert(audioStubStubNotToBeCreated.play.notCalled);
        const result = music.current_audio;
        assert.isFalse(result.loop);
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
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        music.playMusicById('loop');
        assert(audioStubStub.play.called);
        const audioStubStubNotToBeCreated = createStubInstance(AudioStub, { play: null, pause: null });
        audioFactoryStub.create.returns(audioStubStubNotToBeCreated);
        music.playMusicById('noloop');
        assert(audioStubStubNotToBeCreated.play.notCalled);
        const result = music.current_audio;
        assert.isFalse(result.loop);
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
        it('starting music with loop, fade_in and fade_out in data have all of loop, fade_in and fade_out', function () {
            const json = {
                "layer": {
                    "music": "music.ogg",
                    "fade_in": true,
                    "fade_out": true,
                    "loop": true,
                },
            };
            const music = new Music(json, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
            music.playMusicById('layer');
            assert(audioStubStub.play.called);
            const result = music.current_audio;
            assert.isNotNull(result);
            assert.isTrue(result.loop);
            assert.isTrue(result.fade_in);
            assert.isTrue(result.fade_out);
            // Test that volume starts at zero when fading in
            assert.deepEqual(result.volume, 0);
            // Test that volume grows as expected when fading in
            clock.tick(200);
            assert.deepEqual(result.volume, 0.05);
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
    let gameEventEmitterStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
        gameEventEmitterStub = createStubInstance(EventEmitter, { on: () => null });
    });
    it('should handle play_music event by calling playMusic', function () {
        const playMusicStub = stub(Music.prototype, 'playMusic');
        new Music({}, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        const musicData = { music: 'test.ogg' };
        const playMusicCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
            return callback.args[0] === 'play_music';
        }).args[1];
        playMusicCallback(musicData);
        assert.isTrue(playMusicStub.calledOnceWith(musicData));
        playMusicStub.restore();
    });
    it('should handle play_music_by_id event by calling playMusicById', function () {
        const playMusicByIdStub = stub(Music.prototype, 'playMusicById');
        new Music({}, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        const musicId = 'testId';
        const playMusicByIdCallback = uiEventEmitterStub.on.getCalls().find((callback) => {
            return callback.args[0] === 'play_music_by_id';
        }).args[1];
        playMusicByIdCallback(musicId);
        assert.isTrue(playMusicByIdStub.calledOnceWith(musicId));
        playMusicByIdStub.restore();
    });
    it('should handle arrived_in_room event by calling playMusicById', function () {
        const playMusicByIdStub = stub(Music.prototype, 'playMusicById');
        new Music({}, audioFactoryStub, uiEventEmitterStub, gameEventEmitterStub);
        const roomId = 'testId';
        const playMusicByIdCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
            return callback.args[0] === 'arrived_in_room';
        }).args[1];
        playMusicByIdCallback(roomId);
        assert.isTrue(playMusicByIdStub.calledOnceWith(roomId));
        playMusicByIdStub.restore();
    });
});
