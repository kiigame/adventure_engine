import { assert } from 'chai';
import { createStubInstance } from 'sinon';
import DefaultInteractionResolver from './DefaultInteractionResolver.js';
import Interactions from './Interactions.js';

const interactionsStub = createStubInstance(Interactions);

describe('Test DefaultInteractionResolver', function() {
    it('returns the target category set in constructor', function() {
        const defaultInteractionResolver = new DefaultInteractionResolver('test');
        const result = defaultInteractionResolver.getTargetCategory();
        assert.deepEqual('test', result);
    });

    it('returns default examine when no click commands are found from Interactions', function() {
        const defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns(null);
        const target = '1';
        const expected = [{"command":"monologue", "textkey":{"object": "1", "string": "examine"}}];
        const result = defaultInteractionResolver.resolveCommands(interactionsStub, target);
        assert.deepEqual(expected, result);
    });

    it('returns default examine when Interactions.getCommands returns undefied', function() {
        const defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns(undefined);
        const target = '1';
        const expected = [{"command":"monologue", "textkey":{"object": "1", "string": "examine"}}];
        const result = defaultInteractionResolver.resolveCommands(interactionsStub, target);
        assert.deepEqual(expected, result);
    });

    it('returns something from Interactions for click', function() {
        const defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns('something');
        const target = '1';
        const expected = 'something';
        const result = defaultInteractionResolver.resolveCommands(interactionsStub, target);
        assert.deepEqual(expected, result);
    });

    it('returns default monologue for item use when no commands are found from Interactions', function() {
        const defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns(null);
        const target = '1';
        const draggedItem = '2';
        const expected = [{"command":"monologue", "textkey":{"object": "2", "string": "1"}}];
        const result = defaultInteractionResolver.resolveCommands(interactionsStub, draggedItem, target, target);
        assert.deepEqual(expected, result);
    });

    it('returns something from Interactions for item use', function() {
        const defaultInteractionResolver = new DefaultInteractionResolver('test');
        interactionsStub.getCommands.returns('something');
        const target = '1';
        const draggedItem = '2';
        const expected = 'something';
        const result = defaultInteractionResolver.resolveCommands(interactionsStub, draggedItem, target, target);
        assert.deepEqual(expected, result);
    });
});
