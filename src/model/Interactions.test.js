import { assert } from 'chai';
import Interactions from './Interactions.js';

describe('Test Interactions', function() {
    it('will return the single click command', function() {
        const json = "{\"1\": {\"click\": [{\"command\": \"monologue\",\"textkey\": {\"object\": \"1\", \"string\": \"examine\"}}]}}";
        const interactions = new Interactions(JSON.parse(json));
        const entity = '1';
        const action = 'click';
        const expected = [{"command":"monologue", "textkey":{"object": '1', "string": "examine"}}];
        const result = interactions.getCommands(entity, action);
        assert.deepEqual(expected, result);
    });

    it('will return null when json lookup fails', function() {
        const interactions = new Interactions(null);
        const entity = '1';
        const action = 'click';
        const expected = null;
        const result = interactions.getCommands(entity, action);
        assert.strictEqual(expected, result);
    });

    it('will return null when json lookup produces no result', function() {
        const json = "{\"1\": {\"click\": [{\"command\": \"monologue\",\"textkey\": {\"object\": \"1\", \"string\": \"examine\"}}]}}";
        const interactions = new Interactions(JSON.parse(json));
        const entity = '2';
        const action = 'teddy bear';
        const expected = null;
        const result = interactions.getCommands(entity, action);
        assert.strictEqual(expected, result);
    });
});
