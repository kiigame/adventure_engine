import chai from 'chai';
import Text from '../../model/Text.js';

var assert = chai.assert;

describe('Test Text getName function', function() {
    it('returns the name of the object if it exists', function() {
        var json = "{\"object\": {\"key1\": \"Hello\", \"key2\": \"More hello\", \"name\": \"ObjectName\"}}";
        var text = new Text(JSON.parse(json));
        var result = text.getName('object');
        assert.deepEqual(result, 'ObjectName');
    });
    it('returns empty string if the name of the object is not found', function() {
        var json = "{\"object\": {\"key1\": \"Hello\", \"key2\": \"More hello\", \"name\": \"ObjectName\"}}";
        var text = new Text(JSON.parse(json));
        var result = text.getName('otherObject');
        assert.deepEqual(result, '');
    });
});

describe('Test Text getText function', function() {
    it('getText returns examine text of the object if called without specific key', function() {
        var json = "{\"object\": {\"key1\": \"Hello\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}}";
        var text = new Text(JSON.parse(json));
        var result = text.getText('object');
        assert.deepEqual(result, 'The examine text');
    });
    it('getText returns specific text for the object when called with specific key', function() {
        var json = "{\"object\": {\"key1\": \"Hello\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}}";
        var text = new Text(JSON.parse(json));
        var result = text.getText('object', 'key1');
        assert.deepEqual(result, 'Hello');
    });
    it('getText returns object default text when called with nonexisting key for the object', function() {
        var json = "{\"object\": {\"default\": \"Hello default\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}, \"default\": {\"examine\": \"Default examine\"}}";
        var text = new Text(JSON.parse(json));
        var result = text.getText('object', 'key2');
        assert.deepEqual(result, 'Hello default');
    });
    it('getText returns default master examine when called with nonexisting key for the object and no default text for the object exists', function() {
        var json = "{\"object\": {\"key1\": \"Hello\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}, \"default\": {\"examine\": \"Default examine\"}}";
        var text = new Text(JSON.parse(json));
        var result = text.getText('object', 'key2');
        assert.deepEqual(result, 'Default examine');
    });
    it('getText returns error text if default section is missing from texts.json', function() {
        var json = "{\"object\": {\"key1\": \"Hello\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}}";
        var text = new Text(JSON.parse(json));
        var result = text.getText('object', 'key2');
        assert.deepEqual(result, 'Fallback default examine entry missing from texts.json!');
    });
    it('getText returns error text if default section is there but the examine key is missing from texts.json', function() {
        var json = "{\"object\": {\"key1\": \"Hello\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}, \"default\": {\"hexamine\": \"Default hexamine\"}}";
        var text = new Text(JSON.parse(json));
        var result = text.getText('object', 'key2');
        assert.deepEqual(result, 'Fallback default examine entry missing from texts.json!');
    });
});

describe('Test Text setText function', function() {
    it('setText successfully sets text to existing object with new key', function() {
        var json = "{\"object\": {\"default\": \"Hello default\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}, \"default\": {\"examine\": \"Default examine\"}}";
        var text = new Text(JSON.parse(json));
        text.setText('object', 'key2', 'This text was set');
        var result = text.getText('object', 'key2');
        assert.deepEqual(result, 'This text was set');
    });
    it('setText successfully sets text to existing object with existing key', function() {
        var json = "{\"object\": {\"default\": \"Hello default\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}, \"default\": {\"examine\": \"Default examine\"}}";
        var text = new Text(JSON.parse(json));
        text.setText('object', 'default', 'This default text was set');
        var result = text.getText('object', 'nonexistingKey');
        assert.deepEqual(result, 'This default text was set');
    });
    it('setText successfully sets text to new object with new key', function() {
        var json = "{\"object\": {\"default\": \"Hello default\", \"examine\": \"The examine text\", \"name\": \"ObjectName\"}, \"default\": {\"examine\": \"Default examine\"}}";
        var text = new Text(JSON.parse(json));
        text.setText('nonExistingObject', 'key2', 'This text for new object was set');
        var result = text.getText('nonExistingObject', 'key2');
        assert.deepEqual(result, 'This text for new object was set');
    });
});