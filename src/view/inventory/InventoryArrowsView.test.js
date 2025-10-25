import { expect, use } from 'chai';
import { createStubInstance, restore } from 'sinon';
import sinonChai from "sinon-chai";
import InventoryArrowsView from './InventoryArrowsView.js';
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
const { Shape } = pkg;
use(sinonChai);

describe('inventory arrows view tests', () => {
    let uiEventEmitterStub;
    let leftArrowStub;
    let rightArrowStub;
    beforeEach(() => {
        uiEventEmitterStub = createStubInstance(EventEmitter);
        leftArrowStub = createStubInstance(Shape);
        rightArrowStub = createStubInstance(Shape);
    });
    afterEach(() => {
        restore();
    });
    describe('toggle inventory arrows', () => {
        const testCases = {
            'no arrows visible': {
                'parameters': [false, false],
                'expectedCalls': [
                    () => expect(leftArrowStub.hide).to.have.been.called,
                    () => expect(rightArrowStub.hide).to.have.been.called
                ]
            },
            'only right arrow visible': {
                'parameters': [false, true],
                'expectedCalls': [
                    () => expect(leftArrowStub.hide).to.have.been.called,
                    () => expect(rightArrowStub.show).to.have.been.called
                ]
            },
            'only left arrow visible': {
                'parameters': [true, false],
                'expectedCalls': [
                    () => expect(leftArrowStub.show).to.have.been.called,
                    () => expect(rightArrowStub.hide).to.have.been.called
                ]
            },
            'both arrows visible': {
                'parameters': [true, true],
                'expectedCalls': [
                    () => expect(leftArrowStub.show).to.have.been.called,
                    () => expect(rightArrowStub.show).to.have.been.called
                ]
            }
        }

        Object.entries(testCases).forEach(([testName, testCase]) => {
            it(`should toggle arrows correctly when ${testName}`, () => {
                const inventoryArrowsView = new InventoryArrowsView(
                    uiEventEmitterStub,
                    leftArrowStub,
                    rightArrowStub
                );
                inventoryArrowsView.toggleArrowVisibility(...testCase.parameters);
                testCase.expectedCalls.forEach((expectedCall) => {
                    expectedCall;
                });
            });
        });
    });
    describe('handle converting konva ui events to kiigame ui events', () => {
        const clickTestCases = {
            'left arrow click': {
                'konvaEvent': 'click tap',
                'konvaObjectStub': () => leftArrowStub,
                'expectedKiigameEvent': 'inventory_left_arrow_engaged'
            },
            'right arrow click': {
                'konvaEvent': 'click tap',
                'konvaObjectStub': () => rightArrowStub,
                'expectedKiigameEvent': 'inventory_right_arrow_engaged'
            },
        };
        Object.entries(clickTestCases).forEach(([testName, testCase]) => {
            it(`should emit correct kiigame event on ${testName}`, () => {
                new InventoryArrowsView(
                    uiEventEmitterStub,
                    leftArrowStub,
                    rightArrowStub
                );
                const konvaObject = testCase.konvaObjectStub();
                const eventHandler = konvaObject.on.getCalls().find((call) => {
                    return call.args[0] === testCase.konvaEvent;
                }).args[1];
                eventHandler();
                expect(uiEventEmitterStub.emit).to.have.been.calledWith(testCase.expectedKiigameEvent);
            });
        });

        const dragHoverTestCases = {
            'left arrow drag hover': {
                'konvaEvent': 'inventory_left_arrow_draghovered',
                'expectedKiigameEvent': 'inventory_left_arrow_engaged'
            },
            'right arrow drag hover': {
                'konvaEvent': 'inventory_right_arrow_draghovered',
                'expectedKiigameEvent': 'inventory_right_arrow_engaged'
            }
        };
        Object.entries(dragHoverTestCases).forEach(([testName, testCase]) => {
            it(`should emit correct kiigame event on ${testName}`, () => {
                new InventoryArrowsView(
                    uiEventEmitterStub,
                    leftArrowStub,
                    rightArrowStub
                );
                const eventHandler = uiEventEmitterStub.on.getCalls().find((call) => {
                    return call.args[0] === testCase.konvaEvent;
                }).args[1];
                eventHandler();
                expect(uiEventEmitterStub.emit).to.have.been.calledWith(testCase.expectedKiigameEvent);
            });
        });
    });
});
