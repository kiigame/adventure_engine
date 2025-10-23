import { expect } from 'chai';
import OtherChildrenBuilder from './OtherChildrenBuilder.js';

describe('other room children builder tests', () => {
    it('should add other objects as children', () => {
        const otherChildrenBuilder = new OtherChildrenBuilder();
        const otherChildrenJson = {
            "some_other": {
                "data": "mock_data"
            }
        };
        const expected = [
            {
                "data": "mock_data",
                "attrs": {
                    "id": "some_other"
                }
            }
        ];
        const result = otherChildrenBuilder.buildRoomChildren(otherChildrenJson);
        expect(result).to.deep.equal(expected);
    });
});
