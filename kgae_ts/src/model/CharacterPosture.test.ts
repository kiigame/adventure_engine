import { expect } from 'chai';
import { createStubInstance } from 'sinon';
import { CharacterPosture } from './CharacterPosture';
import { EventEmitter } from "@kiigame/kgae_ts";

describe('Character posture model tests', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gameEventEmitterStub: any;

  beforeEach(() => {
    gameEventEmitterStub = createStubInstance(EventEmitter);
  });

  it('should set posture and emit event when change_character_posture is triggered', () => {
    const characterPosture = new CharacterPosture('idle', gameEventEmitterStub as unknown as EventEmitter);
    const changeCharacterPostureCallback = gameEventEmitterStub.on
      .getCalls()
      .find((callback: any) => callback.args[0] === 'change_character_posture')?.args[1]; // eslint-disable-line @typescript-eslint/no-explicit-any

    changeCharacterPostureCallback('standing');

    expect(
      characterPosture.getPosture(),
      'posture does not match'
    ).to.equal('standing');
    expect(
      gameEventEmitterStub.emit.calledWith('character_posture_changed', 'standing'),
      'character_posture_changed not emitted with updated posture'
    ).to.equal(true);
  });

  it('should return the current posture when getPosture is called', () => {
    const characterPosture = new CharacterPosture('idle', gameEventEmitterStub as unknown as EventEmitter);
    expect(
      characterPosture.getPosture(),
      'posture does not match'
    ).to.equal('idle');
  });
});
