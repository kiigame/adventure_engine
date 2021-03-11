import chai from 'chai';
import sinon from 'sinon';
import Music from '../../view/Music.js';
import AudioFactory from '../../view/music/AudioFactory.js';

var assert = chai.assert;
var audioFactoryStub = sinon.createStubInstance(AudioFactory);

describe('Test Music', function() {
    it('playing undefined music does not crash', function() {
        function AudioStub() {};
        audioFactoryStub.create.returns(new AudioStub());
        var json = "{\"layer\": {\"music\": \"music.ogg\"}}";
        let music = new Music(JSON.parse(json), audioFactoryStub);
        music.playMusic(undefined);
        var result = music.getCurrentMusic();
        assert.deepEqual(result, null);
    });
    it('starting music without loop and fade data have neither loop nor fade', function() {
        function AudioStub() {
            this.play = function () {
                // do nothing
            }
        };
        audioFactoryStub.create.returns(new AudioStub());
        var json = "{\"layer\": {\"music\": \"music.ogg\"}}";
        let music = new Music(JSON.parse(json), audioFactoryStub);
        music.playMusic('layer');
        var result = music.getCurrentMusic();
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
        var json = "{\"layer\": {\"music\": \"music.ogg\", \"fade\": false, \"loop\": false}}";
        let music = new Music(JSON.parse(json), audioFactoryStub);
        music.playMusic('layer');
        var result = music.getCurrentMusic();
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
        var json = "{\"layer\": {\"music\": \"music.ogg\", \"fade\": true, \"loop\": true}}";
        let music = new Music(JSON.parse(json), audioFactoryStub);
        music.playMusic('layer');
        var result = music.getCurrentMusic();
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
        var json = "{\"loop\": {\"music\": \"music.ogg\", \"loop\": true}, \"noloop\": {\"music\": \"music.ogg\"}}";
        let music = new Music(JSON.parse(json), audioFactoryStub);
        music.playMusic('loop');
        music.playMusic('noloop');
        var result = music.getCurrentMusic();
        assert.isFalse(result.loop);
    });
    it('in two subsequent rooms with same music, respect if the second room explicitly sets looping to false', function() {
        function AudioStub() {
            this.play = function () {
                // do nothing
            }
        };
        audioFactoryStub.create.returns(new AudioStub());
        var json = "{\"loop\": {\"music\": \"music.ogg\", \"loop\": true}, \"noloop\": {\"music\": \"music.ogg\", \"loop\": false}}";
        let music = new Music(JSON.parse(json), audioFactoryStub);
        music.playMusic('loop');
        music.playMusic('noloop');
        var result = music.getCurrentMusic();
        assert.isFalse(result.loop);
    });
    // TODO: More test cases
});
