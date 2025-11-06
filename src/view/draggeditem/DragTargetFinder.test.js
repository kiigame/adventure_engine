import { expect, use } from 'chai';
import { createStubInstance, restore, reset, stub } from 'sinon';
import sinonChai from "sinon-chai";
import DragTargetFinder from './DragTargetFinder.js';
import { Intersection } from './intersection/Intersection.js';
import RoomView from '../room/RoomView.js';
import InventoryArrowsView from '../inventory/InventoryArrowsView.js';
import InventoryItemsView from '../inventory/InventoryItemsView.js';
import pkg from 'konva';
const { Shape } = pkg;

use(sinonChai);

describe('drag target finder tests', () => {
    describe('drag target found', () => {
        let intersectionStub;
        let draggedItemStub;
        let previousItemStub;
        let leftArrowStub;
        let rightArrowStub;
        let visibleObjectsFromCurrentRoomStubs = [];
        let visibleInventoryItemsStubs = [];
        let roomViewStub;
        let inventoryItemsViewStub;
        let inventoryArrowsViewStub;

        // This stubbing is slow, but if it's not done in beforeEach running the whole suite does not work
        beforeEach(() => {
            draggedItemStub = createStubInstance(Shape, { getAttrs: { id: 'draggedItem' } });
            previousItemStub = createStubInstance(Shape, { getAttrs: { id: 'previousItem' } });
            leftArrowStub = createStubInstance(Shape, { getAttrs: { id: 'inventory_left_arrow' } });
            rightArrowStub = createStubInstance(Shape, { getAttrs: { id: 'inventory_right_arrow' } });
            visibleObjectsFromCurrentRoomStubs = [
                createStubInstance(Shape, { getAttrs: { id: 'roomObject1' } }),
                createStubInstance(Shape, { getAttrs: { id: 'roomObject2' } }),
            ];
            visibleInventoryItemsStubs = [
                createStubInstance(Shape, { getAttrs: { id: 'inventoryItem1' } }),
                createStubInstance(Shape, { getAttrs: { id: 'inventoryItem2' } }),
            ];
            intersectionStub = createStubInstance(Intersection);
            roomViewStub = createStubInstance(RoomView);
            roomViewStub.getVisibleObjectsFromCurrentRoom.returns(visibleObjectsFromCurrentRoomStubs);
            inventoryItemsViewStub = createStubInstance(InventoryItemsView);
            inventoryItemsViewStub.getVisibleInventoryItems.returns(visibleInventoryItemsStubs);
            inventoryArrowsViewStub = createStubInstance(InventoryArrowsView);
            inventoryArrowsViewStub.leftArrow = leftArrowStub;
            inventoryArrowsViewStub.rightArrow = rightArrowStub;
        });
        afterEach(() => {
            restore();
        });

        const testCases = {
            'left arrow': {
                'matches': [() => leftArrowStub],
                'previous': () => undefined,
                'expected': () => leftArrowStub
            },
            'left arrow even with previous target': {
                'matches': [() => leftArrowStub, () => previousItemStub],
                'previous': () => previousItemStub,
                'expected': () => leftArrowStub
            },
            'right arrow': {
                'matches': [() => rightArrowStub],
                'previous': () => undefined,
                'expected': () => rightArrowStub
            },
            'room object': {
                'matches': [() => visibleObjectsFromCurrentRoomStubs[0]],
                'previous': () => undefined,
                'expected': () => visibleObjectsFromCurrentRoomStubs[0]
            },
            'second room object': {
                'matches': [() => visibleObjectsFromCurrentRoomStubs[1]],
                'previous': () => undefined,
                'expected': () => visibleObjectsFromCurrentRoomStubs[1]
            },
            'inventory item': {
                'matches': [() => visibleInventoryItemsStubs[1]],
                'previous': () => undefined,
                'expected': () => visibleInventoryItemsStubs[1]
            },
            'previous target': {
                'matches': [() => previousItemStub],
                'previous': () => previousItemStub,
                'expected': () => previousItemStub
            },
            'previous target over room object': {
                'matches': [() => previousItemStub, () => visibleObjectsFromCurrentRoomStubs[0]],
                'previous': () => previousItemStub,
                'expected': () => previousItemStub
            }
        };

        Object.entries(testCases).forEach(([caseName, caseData]) => {
            it(`should return ${caseName}`, () => {
                const dragTargetFinder = new DragTargetFinder(
                    intersectionStub,
                    roomViewStub,
                    inventoryItemsViewStub,
                    inventoryArrowsViewStub
                );

                caseData['matches'].forEach((match) => {
                    intersectionStub.check.withArgs(draggedItemStub, match()).returns(true);
                });
                const result = dragTargetFinder.findDragTarget(draggedItemStub, caseData['previous']());
                expect(result.getAttrs().id).to.equal(caseData['expected']().getAttrs().id);
            });
        });
    });
    describe('no intersections found', () => {
        afterEach(() => {
            restore();
        });
        it('should return undefined when no intersections are found', () => {
            const intersectionStub = createStubInstance(Intersection);
            const roomViewStub = createStubInstance(RoomView);
            const inventoryItemsViewStub = createStubInstance(InventoryItemsView);

            const dragTargetFinder = new DragTargetFinder(
                intersectionStub,
                roomViewStub,
                inventoryItemsViewStub,
                createStubInstance(InventoryArrowsView)
            );

            intersectionStub.check.returns(false);
            roomViewStub.getVisibleObjectsFromCurrentRoom.returns([]);
            inventoryItemsViewStub.getVisibleInventoryItems.returns([]);

            const result = dragTargetFinder.findDragTarget(createStubInstance(Shape));

            expect(result).to.be.undefined;
        });
    });
});
