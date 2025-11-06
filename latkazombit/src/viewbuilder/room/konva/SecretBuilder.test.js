import { expect } from 'chai';
import { SecretBuilder } from './SecretBuilder.js';

describe('Lätkäzombit/LZ secret room children builder tests', () => {
    it('should add secret objects as children', () => {
        const secretChildrenBuilder = new SecretBuilder();
        const secretChildrenJson = {
            "some_other": {
                "data": "mock_data"
            }
        };
        const expected = [
            {
                "data": "mock_data",
                "attrs": {
                    "id": "some_other",
                    "category": "secret"
                }
            }
        ];
        const result = secretChildrenBuilder.buildRoomChildren(secretChildrenJson);
        expect(result).to.deep.equal(expected);
    });
});
