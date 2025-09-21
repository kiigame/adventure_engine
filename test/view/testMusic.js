import { assert } from 'chai';
import sinon from 'sinon';
import Music from '../../view/Music.js';
import AudioFactory from '../../view/music/AudioFactory.js';

const audioFactoryStub = sinon.createStubInstance(AudioFactory);

describe('Test Music', function() {
    it('playing undefined music does not crash', function() {
        function AudioStub() {};
        audioFactoryStub.create.returns(new AudioStub());
        const json = {
            "layer": {
                "music": "music.ogg",
            },
        };
        const music = new Music(json, audioFactoryStub);
        music.playMusic(undefined);
        const result = music.getCurrentMusic();
        assert.deepEqual(result, null);
    });
    it('starting music without loop and fade data have neither loop nor fade', function() {
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
        music.playMusic('layer');
        const result = music.getCurrentMusic();
        assert.isNotNull(result);
        assert.isFalse(result.loop);
        assert.isFalse(result.fade);
        assert.deepEqual(result.volume, 1);
    });
    it('starting music with explicit false for loop and fade data have neither loop nor fade', function() {
        function AudioStub() {
            this.play = function () {
                // do nothing
            }
        };
        audioFactoryStub.create.returns(new AudioStub());
        const json = {
            "layer": {
                "music": "music.ogg",
                "fade": false,
                "loop": false,
            },
        };
        const music = new Music(json, audioFactoryStub);
        music.playMusic('layer');
        const result = music.getCurrentMusic();
        assert.isNotNull(result);
        assert.isFalse(result.loop);
        assert.isFalse(result.fade);
        assert.deepEqual(result.volume, 1);
    });
    it('starting music with loop and fade data have both loop nor fade', function() {
        function AudioStub() {
            this.play = function () {
                // do nothing
            }
        };
        audioFactoryStub.create.returns(new AudioStub());
        const json = {
            "layer": {
                "music": "music.ogg",
                "fade": true,
                "loop": true,
            },
        };
        const music = new Music(json, audioFactoryStub);
        music.playMusic('layer');
        const result = music.getCurrentMusic();
        assert.isNotNull(result);
        assert.isTrue(result.loop);
        assert.isTrue(result.fade);
        // Cludgy way to test that the volume starts at 0
        assert.deepEqual(result.volume, 0);
    });
    it('in two subsequent rooms with same music, respect if the second room implicitly sets looping to false', function() {
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
        music.playMusic('loop');
        music.playMusic('noloop');
        const result = music.getCurrentMusic();
        assert.isFalse(result.loop);
    });
    it('in two subsequent rooms with same music, respect if the second room explicitly sets looping to false', function() {
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
        music.playMusic('loop');
        music.playMusic('noloop');
        const result = music.getCurrentMusic();
        assert.isFalse(result.loop);
    });
    // TODO: More test cases
});
