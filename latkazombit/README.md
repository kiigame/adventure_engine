# Lätkäzombit

Lätkäzombit is the game where the KiiGame project originated from. It still serves as the reference game for the engine.

The game is in the Finnish language.

## Development

To run typecheck and unit tests, the engine needs to be bundled first:

```
cd kiigame
npm run build
cd ../latkazombit
npm run typecheck
npm test
```

## Game-specific features

### Jersey number

At the start of the game, the player can input a jersey number. This jersey number is printed on the hockey jersey of the player character in locker room 2. There's a text entry for each number, which contains career information about an actual NHL player who wore that number.

### Secrets

There are secrets hidden in rooms that do not show up when you drag an inventory item around, instead they need to be (fairly precicely) clicked on to be picked up.

The transition to the final room will remove all inventory items except the secrets, and displays a counter how many the player found.

