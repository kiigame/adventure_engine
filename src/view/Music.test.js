import { assert } from 'chai';
import { createStubInstance, useFakeTimers, stub } from 'sinon';
import Music from './Music.js';
import AudioFactory from './music/AudioFactory.js';
import EventEmitter from '../events/EventEmitter.js';

const audioFactoryStub = createStubInstance(AudioFactory);
const uiEventEmitterStub = createStubInstance(EventEmitter, { on: null });

describe('test Music methods', function () {
    it('playing undefined music does not crash', function () {
        function AudioStub() { };
        audioFactoryStub.create.returns(new AudioStub());
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
        music.playMusic(undefined);
        const result = music.current_audio;
        assert.deepEqual(result, null);
    });
    it('starting music without loop, fade_in or fade_out data will not have loop, fade_in or fade_out', function () {
        function AudioStub() {
            this.play = function () {
                // do nothing
            }
        };
        audioFactoryStub.create.returns(new AudioStub());
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
        music.playMusicById('layer');
        const result = music.current_audio;
        assert.isNotNull(result);
        assert.isFalse(result.loop);
        assert.isFalse(result.fade_in);
        assert.isFalse(result.fade_out);
        assert.deepEqual(result.volume, 1);
    });
    it('starting music with explicit false for loop, fade_in and fade_out in data will not fave loop, fade_in or fade_out', function () {
        function AudioStub() {
            this.play = function () {
                // do nothing
            }
        };
        audioFactoryStub.create.returns(new AudioStub());
        const json = {
            "layer": {
                "music": "music.ogg",
                "fade_in": false,
                "fade_out": false,
                "loop": false,
            },
        };
        const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
        music.playMusicById('layer');
        const result = music.current_audio;
        assert.isNotNull(result);
        assert.isFalse(result.loop);
        assert.isFalse(result.fade_in);
        assert.isFalse(result.fade_out);
        assert.deepEqual(result.volume, 1);
    });
    it('in two subsequent rooms with same music, respect if the second room implicitly sets looping to false', function () {
        function AudioStub() {
            this.play = function () {
                // do nothing
            }
        };
        audioFactoryStub.create.returns(new AudioStub());
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
        music.playMusicById('noloop');
        const result = music.current_audio;
        assert.isFalse(result.loop);
    });
    it('in two subsequent rooms with same music, respect if the second room explicitly sets looping to false', function () {
        function AudioStub() {
            this.play = function () {
                // do nothing
            }
        };
        audioFactoryStub.create.returns(new AudioStub());
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
        music.playMusicById('noloop');
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
            function AudioStub() {
                this.play = function () {
                    // do nothing
                }
            };
            audioFactoryStub.create.returns(new AudioStub());
            const json = {
                "layer": {
                    "music": "music.ogg",
                    "fade_in": true,
                    "fade_out": true,
                    "loop": true,
                },
            };
            const music = new Music(json, audioFactoryStub, uiEventEmitterStub);
            music.playMusicById('layer');
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
    it('should handle play_music event by calling playMusic', function () {
        const playMusicStub = stub(Music.prototype, 'playMusic');
        const music = new Music({}, audioFactoryStub, uiEventEmitterStub);
        const musicData = { music: 'test.ogg' };

        // Get the callback that was registered for play_music event
        const playMusicCallback = uiEventEmitterStub.on.getCall(0).args[1];
        playMusicCallback(musicData);
        assert.isTrue(playMusicStub.calledOnceWith(musicData));
        playMusicStub.restore();
    });

     it('should handle play_music_by_id event by calling playMusicById', function () {
        const playMusicByIdStub = stub(Music.prototype, 'playMusicById');
        const music = new Music({}, audioFactoryStub, uiEventEmitterStub);
        const musicId = 'testId';

        // Get the callback that was registered for play_music_by_id event
        const playMusicByIdCallback = uiEventEmitterStub.on.getCall(1).args[1];
        playMusicByIdCallback(musicId);
        assert.isTrue(playMusicByIdStub.calledOnceWith(musicId));
        playMusicByIdStub.restore();
    });
});
