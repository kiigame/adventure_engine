import { expect, use } from 'chai';
import { createStubInstance } from 'sinon';
import sinonChai from "sinon-chai";
import ObjectsInRooms from './ObjectsInRooms.js';
import EventEmitter from '../events/EventEmitter.js';
use(sinonChai);

describe('Objects in rooms model tests', () => {
    let initialState = {};
    let gameEventEmitterStub;
    let uiEventEmitterStub;
    beforeEach(() => {
        gameEventEmitterStub = createStubInstance(EventEmitter);
        uiEventEmitterStub = createStubInstance(EventEmitter);
        initialState = {
            'room_one': {
                'furniture': {
                    'object_1': {
                        'visible': true
                    },
                    'object_2': {
                        'visible': false
                    }
                },
                'other_type': {
                    'object_3': {
                        'visible': false
                    },
                    'object_4': {
                        'visible': true
                    }
                }
            }
        };
    });
    describe('remove objects from room', () => {
        it('should set visible to false for a visible object existing in room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub, uiEventEmitterStub);
            const removeObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'remove_objects';
            }).args[1];
            removeObjectsCallback(['object_1']);
            expect(uiEventEmitterStub.emit, 'removed_objects not emitted as expected').to.have.been.calledWith(
                'removed_objects',
                {
                    'objectList': {
                        'room_one': {
                            'furniture': {
                                'object_1': { 'visible': false },
                                'object_2': { 'visible': false }
                            },
                            'other_type': {
                                'object_3': { 'visible': false },
                                'object_4': { 'visible': true }
                            }
                        },
                    },
                    'objectsRemoved': ['object_1']
                }
            );
        });
        it('should set visible to false for visible objects of different types existing in room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub, uiEventEmitterStub);
            const removeObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'remove_objects';
            }).args[1];
            removeObjectsCallback(['object_1', 'object_4']);
            expect(uiEventEmitterStub.emit, 'removed_objects not emitted as expected').to.have.been.calledWith(
                'removed_objects',
                {
                    'objectList': {
                        'room_one': {
                            'furniture': {
                                'object_1': { 'visible': false },
                                'object_2': { 'visible': false }
                            },
                            'other_type': {
                                'object_3': { 'visible': false },
                                'object_4': { 'visible': false }
                            }
                        },
                    },
                    'objectsRemoved': ['object_1', 'object_4']
                }
            );
        });
    });
    describe('add objects to room', () => {
        it('should set visible to true for a non-visible object existing in room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub, uiEventEmitterStub);
            const addObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'add_objects';
            }).args[1];
            addObjectsCallback(['object_2']);
            expect(uiEventEmitterStub.emit, 'added_objects not emitted as expected').to.have.been.calledWith(
                'added_objects',
                {
                    'objectList': {
                        'room_one': {
                            'furniture': {
                                'object_1': { 'visible': true },
                                'object_2': { 'visible': true }
                            },
                            'other_type': {
                                'object_3': { 'visible': false },
                                'object_4': { 'visible': true }
                            }
                        },
                    },
                    'objectsAdded': ['object_2']
                }
            );
        });
                it('should set visible to true for non-visible objects of different types existing in room', () => {
            new ObjectsInRooms(initialState, gameEventEmitterStub, uiEventEmitterStub);
            const addObjectsCallback = gameEventEmitterStub.on.getCalls().find((callback) => {
                return callback.args[0] === 'add_objects';
            }).args[1];
            addObjectsCallback(['object_2', 'object_3']);
            expect(uiEventEmitterStub.emit, 'added_objects not emitted as expected').to.have.been.calledWith(
                'added_objects',
                {
                    'objectList': {
                        'room_one': {
                            'furniture': {
                                'object_1': { 'visible': true },
                                'object_2': { 'visible': true }
                            },
                            'other_type': {
                                'object_3': { 'visible': true },
                                'object_4': { 'visible': true }
                            }
                        },
                    },
                    'objectsAdded': ['object_2', 'object_3']
                }
            );
        });
    });
});
