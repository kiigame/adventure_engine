import { expect } from 'chai';
import FurnitureBuilder from './FurnitureBuilder.js';

describe('furniture builder tests', () => {
    it('should add furniture as children', () => {
        const furnitureBuilder = new FurnitureBuilder();
        const furnitureJson = {
            "some_furniture":
            {
                "data": "mock_data"
            }
        };
        const expected = [
            {
                "data": "mock_data",
                "attrs": {
                    "category": "furniture",
                    "id": "some_furniture"
                }
            }
        ];
        const result = furnitureBuilder.buildRoomChildren(furnitureJson);
        expect(result).to.deep.equal(expected);
    });
    it('should set initially visible furniture as visible in Konva data', () => {
        const furnitureBuilder = new FurnitureBuilder();
        const furnitureJson = {
            "some_furniture":
            {
                "initiallyVisible": true,
                "data": "mock_data"
            }
        };
        const expected = [
            {
                "data": "mock_data",
                "attrs": {
                    "category": "furniture",
                    "id": "some_furniture",
                    "visible": true
                }
            }
        ];
        const result = furnitureBuilder.buildRoomChildren(furnitureJson);
        expect(result).to.deep.equal(expected);
    });
    it('should set initially not visible furniture as not visible in Konva data', () => {
        const furnitureBuilder = new FurnitureBuilder();
        const furnitureJson = {
            "some_furniture":
            {
                "initiallyVisible": false,
                "data": "mock_data"
            }
        };
        const expected = [
            {
                "data": "mock_data",
                "attrs": {
                    "category": "furniture",
                    "id": "some_furniture",
                    "visible": false
                }
            }
        ];
        const result = furnitureBuilder.buildRoomChildren(furnitureJson);
        expect(result).to.deep.equal(expected);
    });

});
