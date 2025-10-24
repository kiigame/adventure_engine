import { expect, use } from 'chai';
import { createStubInstance } from 'sinon';
import sinonChai from "sinon-chai";
import ObjectsInRooms from './ObjectsInRooms.js';
import EventEmitter from '../events/EventEmitter.js';
use(sinonChai);

describe('Objects in rooms model tests', () => {
    let initialState = {};
    let gameEventEmitterStub;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter);
        initialState = {
            'room_one': {
                'object_1': {
                    'visible': true,
                    'category': 'furniture'
                },
                'object_2': {
                    'visible': false,
                    'category': 'furniture'
                },
                'object_3': {
                    'visible': false,
                    'category': 'other_type'
                },
                'object_4': {
                    'visible': true,
                    'category': 'other_type'
                }
            }
        };
    });
    describe('remove objects from room', () => {
        it('should set visible to false for a visible object existing in room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const removeObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'remove_objects';
            }).args[1];
            removeObjectsCallback(['object_1']);
            expect(gameEventEmitterStub.emit, 'removed_objects not emitted as expected').to.have.been.calledWith(
                'removed_objects',
                {
                    'objectList': {
                        'room_one': {
                            'object_1': { 'visible': false, 'category': 'furniture' },
                            'object_2': { 'visible': false, 'category': 'furniture' },
                            'object_3': { 'visible': false, 'category': 'other_type' },
                            'object_4': { 'visible': true, 'category': 'other_type' }
                        }
                    },
                    'objectsRemoved': ['object_1']
                }
            );
        });
        it('should set visible to false for visible objects of different types existing in room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const removeObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'remove_objects';
            }).args[1];
            removeObjectsCallback(['object_1', 'object_4']);
            expect(gameEventEmitterStub.emit, 'removed_objects not emitted as expected').to.have.been.calledWith(
                'removed_objects',
                {
                    'objectList': {
                        'room_one': {
                            'object_1': { 'visible': false, 'category': 'furniture' },
                            'object_2': { 'visible': false, 'category': 'furniture' },
                            'object_3': { 'visible': false, 'category': 'other_type' },
                            'object_4': { 'visible': false, 'category': 'other_type' }
                        }
                    },
                    'objectsRemoved': ['object_1', 'object_4']
                }
            );
        });
    });
    describe('add objects to room', () => {
        it('should set visible to true for a non-visible object existing in room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const addObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'add_objects';
            }).args[1];
            addObjectsCallback(['object_2']);
            expect(gameEventEmitterStub.emit, 'added_objects not emitted as expected').to.have.been.calledWith(
                'added_objects',
                {
                    'objectList': {
                        'room_one': {
                            'object_1': { 'visible': true, 'category': 'furniture' },
                            'object_2': { 'visible': true, 'category': 'furniture' },
                            'object_3': { 'visible': false, 'category': 'other_type' },
                            'object_4': { 'visible': true, 'category': 'other_type' }
                        }
                    },
                    'objectsAdded': ['object_2']
                }
            );
        });
        it('should set visible to true for non-visible objects of different types existing in room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub);
            const addObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'add_objects';
            }).args[1];
            addObjectsCallback(['object_2', 'object_3']);
            expect(gameEventEmitterStub.emit, 'added_objects not emitted as expected').to.have.been.calledWith(
                'added_objects',
                {
                    'objectList': {
                        'room_one': {
                            'object_1': { 'visible': true, 'category': 'furniture' },
                            'object_2': { 'visible': true, 'category': 'furniture' },
                            'object_3': { 'visible': true, 'category': 'other_type' },
                            'object_4': { 'visible': true, 'category': 'other_type' }
                        }
                    },
                    'objectsAdded': ['object_2', 'object_3']
                }
            );
        });
    });
});
