import chai from 'chai';
import sinon from 'sinon';
import DefaultInteractionResolver from '../../model/DefaultInteractionResolver.js';
import Interactions from '../../model/Interactions.js';

var assert = chai.assert;

var interactionsStub = sinon.createStubInstance(Interactions);

describe('Test DefaultInteractionResolver', function() {
    it('returns the target category set in constructor', function() {
        let defaultInteractionResolver = new DefaultInteractionResolver('test');
        var result = defaultInteractionResolver.getTargetCategory();
        assert.deepEqual('test', result);
    });

    it('returns default examine when no click commands are found from Interactions', function() {
        let defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns(null);

        var target = '1';

        var expected = [{"command":"monologue", "textkey":{"object": "1", "string": "examine"}}];
        var result = defaultInteractionResolver.resolveCommands(interactionsStub, target);
        assert.deepEqual(expected, result);
    });

    it('returns default examine when Interactions.getCommands returns undefied', function() {
        let defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns(undefined);

        var target = '1';

        var expected = [{"command":"monologue", "textkey":{"object": "1", "string": "examine"}}];
        var result = defaultInteractionResolver.resolveCommands(interactionsStub, target);
        assert.deepEqual(expected, result);
    });


    it('returns something from Interactions for click', function() {
        let defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns('something');

        var target = '1';
        var expected = 'something';
        var result = defaultInteractionResolver.resolveCommands(interactionsStub, target);
        assert.deepEqual(expected, result);
    });

    it('returns default monologue for item use when no commands are found from Interactions', function() {
        let defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns(null);

        var target = '1';
        var draggedItem = '2';

        var expected = [{"command":"monologue", "textkey":{"object": "2", "string": "1"}}];
        var result = defaultInteractionResolver.resolveCommands(interactionsStub, draggedItem, target, target);
        assert.deepEqual(expected, result);
    });

    it('returns something from Interactions for item use', function() {
        let defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns('something');

        var target = '1';
        var draggedItem = '2';
        var expected = 'something';
        var result = defaultInteractionResolver.resolveCommands(interactionsStub, draggedItem, target, target);
        assert.deepEqual(expected, result);
    });
});
