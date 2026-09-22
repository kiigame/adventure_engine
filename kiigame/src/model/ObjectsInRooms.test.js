import { expect, use } from 'chai';
import { createStubInstance } from 'sinon';
import sinonChai from "sinon-chai";
import ObjectsInRooms from './ObjectsInRooms.js';
import { EventEmitter } from '../events/EventEmitter.js';
use(sinonChai);

describe('Objects in rooms model tests', () => {
    let initialState = {};
    let gameEventEmitterStub;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter);
        initialState = {
            'room_one': [
                {
                    'name': 'object_1',
                },
                {
                    'name': 'object_2',
                },
                {
                    'name': 'object_3',
                },
                {
                    'name': 'object_4',
                }
            ]
        };
    });
    describe('remove objects from room', () => {
        it('should remove an object that exists in a room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const removeObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'remove_objects';
            }).args[1];
            removeObjectsCallback(['object_1']);
            expect(gameEventEmitterStub.emit, 'removed_objects not emitted as expected').to.have.been.calledWith(
                'removed_objects',
                {
                    'objectList': {
                        'room_one': [
                            { 'name': 'object_2' },
                            { 'name': 'object_3' },
                            { 'name': 'object_4' }
                        ]
                    },
                    'objectsRemoved': ['object_1']
                }
            );
        });
        it('should remove multiple objects that exist in a room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const removeObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'remove_objects';
            }).args[1];
            removeObjectsCallback(['object_1', 'object_4']);
            expect(gameEventEmitterStub.emit, 'removed_objects not emitted as expected').to.have.been.calledWith(
                'removed_objects',
                {
                    'objectList': {
                        'room_one': [
                            { 'name': 'object_2' },
                            { 'name': 'object_3' },
                        ]
                    },
                    'objectsRemoved': ['object_1', 'object_4']
                }
            );
        });
        it('should not remove an object that does not exist in a room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const removeObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'remove_objects';
            }).args[1];
            removeObjectsCallback(['object_5']);
            expect(gameEventEmitterStub.emit, 'removed_objects not emitted as expected').to.have.been.calledWith(
                'removed_objects',
                {
                    'objectList': {
                        'room_one': [
                            { 'name': 'object_1' },
                            { 'name': 'object_2' },
                            { 'name': 'object_3' },
                            { 'name': 'object_4' }
                        ]
                    },
                    'objectsRemoved': []
                }
            );
        });
    });
    describe('add objects to room', () => {
        it('should add an object that did not exist in the room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const addObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'add_objects';
            }).args[1];
            addObjectsCallback({ 'objectNames': ['object_5'], 'roomId': 'room_one' });
            expect(gameEventEmitterStub.emit, 'added_objects not emitted as expected').to.have.been.calledWith(
                'added_objects',
                {
                    'objectList': {
                        'room_one': [
                            { 'name': 'object_1' },
                            { 'name': 'object_2' },
                            { 'name': 'object_3' },
                            { 'name': 'object_4' },
                            { 'name': 'object_5' }
                        ]
                    },
                    'objectsAdded': ['object_5']
                }
            );
        });
        it('should add multiple objects that did not exist in the room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const addObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'add_objects';
            }).args[1];
            addObjectsCallback({ 'objectNames': ['object_5', 'object_6'], 'roomId': 'room_one' });
            expect(gameEventEmitterStub.emit, 'added_objects not emitted as expected').to.have.been.calledWith(
                'added_objects',
                {
                    'objectList': {
                        'room_one': [
                            { 'name': 'object_1' },
                            { 'name': 'object_2' },
                            { 'name': 'object_3' },
                            { 'name': 'object_4' },
                            { 'name': 'object_5' },
                            { 'name': 'object_6' }
                        ]
                    },
                    'objectsAdded': ['object_5', 'object_6']
                }
            );
        });
        it('should not add an object that already exists in the room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const addObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'add_objects';
            }).args[1];
            addObjectsCallback({ 'objectNames': ['object_1'], 'roomId': 'room_one' });
            expect(gameEventEmitterStub.emit, 'added_objects not emitted as expected').to.have.been.calledWith(
                'added_objects',
                {
                    'objectList': {
                        'room_one': [
                            { 'name': 'object_1' },
                            { 'name': 'object_2' },
                            { 'name': 'object_3' },
                            { 'name': 'object_4' }
                        ]
                    },
                    'objectsAdded': []
                }
            );
        });
    });
});
