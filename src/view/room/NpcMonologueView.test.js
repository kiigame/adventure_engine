import { expect, use } from 'chai';
import { createStubInstance, restore, match } from 'sinon';
import sinonChai from "sinon-chai";
import NpcMonologueView from './NpcMonologueView.js';
import EventEmitter from '../../events/EventEmitter.js';
import pkg from 'konva';
const { Text, Tag, Label, Shape } = pkg;
use(sinonChai);

describe('npc monologue view tests', () => {
    describe('draw npc speech bubble correctly', () => {
        let uiEventEmitterStub;
        let gameEventEmitterStub;
        let npcSpeechBubbleStub;
        let npcMonologueTextStub;
        let npcTagStub;
        let npcStub;
        beforeEach(() => {
            uiEventEmitterStub = createStubInstance(EventEmitter);
            gameEventEmitterStub = createStubInstance(EventEmitter);
            npcMonologueTextStub = createStubInstance(Text);
            npcTagStub = createStubInstance(Tag);
            npcSpeechBubbleStub = createStubInstance(Label, {
                getText: npcMonologueTextStub,
                getTag: npcTagStub
            });
            npcStub = createStubInstance(Shape);
        });
        afterEach(() => {
            restore();
        })

        const testCases = {
            'correctly for an NPC on the left side of the screen': {
                'npc.x': 74,
                'npc.width': 87,
                'npc.y': 102,
                'npc.height': 353,
                'npcMonologueText.width': [73.76666641235352, 74, 74],
                'expectedPointerDirection': 'left',
                'expectedNpcMonologueText.width': [undefined, 74, undefined],
                'expectedNpcSpeechBubble.x': 161,
                'expectedNpcSpeechBubble.y': 220,
            },
            'correctly for an NPC on the right side of the screen': {
                'npc.x': 856,
                'npc.width': 88,
                'npc.y': 83,
                'npc.height': 354,
                'npcMonologueText.width': [120.33333587646484, 120, 120],
                'expectedPointerDirection': 'right',
                'expectedNpcMonologueText.width': [undefined, 120, undefined],
                'expectedNpcSpeechBubble.x': 856,
                'expectedNpcSpeechBubble.y': 201,
            }
        };
        Object.entries(testCases).forEach(([caseName, parameters]) => {
            it(`should set bubble attributes ${caseName}`, () => {
                npcStub.x.returns(parameters['npc.x']);
                npcStub.width.returns(parameters['npc.width']);
                npcStub.y.returns(parameters['npc.y']);
                npcStub.height.returns(parameters['npc.height']);
                parameters['npcMonologueText.width'].forEach((value, index) => {
                    npcMonologueTextStub.width.onCall(index).returns(value);
                });
                const npcMonologueView = new NpcMonologueView(
                    uiEventEmitterStub,
                    gameEventEmitterStub,
                    npcSpeechBubbleStub,
                    981
                );
                npcMonologueView.npcMonologue(npcStub, 'blabla');
                expect(npcTagStub.pointerDirection).to.have.been.calledWith(
                    parameters['expectedPointerDirection']
                );
                parameters['expectedNpcMonologueText.width'].forEach((value, index) => {
                    expect(npcMonologueTextStub.width.getCall(index).args[0]).to.equal(value);
                });
                expect(npcSpeechBubbleStub.x).to.have.been.calledWithMatch(
                    parameters['expectedNpcSpeechBubble.x']
                );
                expect(npcSpeechBubbleStub.y).to.have.been.calledWithMatch(
                    parameters['expectedNpcSpeechBubble.y']
                );
            });
        });
    });
});
