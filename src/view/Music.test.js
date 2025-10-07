import { assert } from 'chai';
import sinon from 'sinon';
import Music from './Music.js';
import AudioFactory from './music/AudioFactory.js';

const audioFactoryStub = sinon.createStubInstance(AudioFactory);

describe('Test Music', function () {
    it('playing undefined music does not crash', function () {
        function AudioStub() { };
        audioFactoryStub.create.returns(new AudioStub());
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub);
        music.playMusic(undefined);
        const result = music.current_music;
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
        const music = new Music(json, audioFactoryStub);
        music.playMusicById('layer');
        const result = music.current_music;
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
        const music = new Music(json, audioFactoryStub);
        music.playMusicById('layer');
        const result = music.current_music;
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
        const music = new Music(json, audioFactoryStub);
        music.playMusicById('loop');
        music.playMusicById('noloop');
        const result = music.current_music;
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
        const music = new Music(json, audioFactoryStub);
        music.playMusicById('loop');
        music.playMusicById('noloop');
        const result = music.current_music;
        assert.isFalse(result.loop);
    });
    describe('fades', function () {
        let clock;
        before(function () {
            clock = sinon.useFakeTimers();
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
            const music = new Music(json, audioFactoryStub);
            music.playMusicById('layer');
            const result = music.current_music;
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
