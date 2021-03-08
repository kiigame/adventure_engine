import chai from 'chai';
import sinon from 'sinon';
import Interactions from '../../model/Interactions.js';

var assert = chai.assert;

describe('Test Interactions', function() {
    it('will return the single click command', function() {
        var json = "{\"1\": {\"click\": [{\"command\": \"monologue\",\"textkey\": {\"object\": \"1\", \"string\": \"examine\"}}]}}";
        let interactions = new Interactions(JSON.parse(json));
        var entity = '1';
        var action = 'click';
        var expected = [{"command":"monologue", "textkey":{"object": '1', "string": "examine"}}];
        var result = interactions.getCommands(entity, action);
        assert.deepEqual(expected, result);
    });

    it('will return null when json lookup fails', function() {
        let interactions = new Interactions(null);
        var entity = '1';
        var action = 'click';
        var expected = null;
        var result = interactions.getCommands(entity, action);
        assert.strictEqual(expected, result);
    });

    it('will return null when json lookup produces no result', function() {
        var json = "{\"1\": {\"click\": [{\"command\": \"monologue\",\"textkey\": {\"object\": \"1\", \"string\": \"examine\"}}]}}";
        let interactions = new Interactions(JSON.parse(json));
        var entity = '2';
        var action = 'teddy bear';
        var expected = null;
        var result = interactions.getCommands(entity, action);
        assert.strictEqual(expected, result);
    });
});
