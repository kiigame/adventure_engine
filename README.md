# KiiGame Adventure Engine monorepo

[![Node CI](https://github.com/kiigame/adventure_engine/actions/workflows/nodejs.yml/badge.svg?branch=main)](https://github.com/kiigame/adventure_engine/actions)
[![Netlify Status](https://api.netlify.com/api/v1/badges/697d2167-ec6d-4d1a-98dd-9ae075af4fd5/deploy-status)](https://app.netlify.com/sites/kgae/deploys)

## Monorepo contents

The repository is set up as a monorepo at least for now. More information on individual components below.

The monorepo configuration is primarily intended as a tool to help separate the KGAE game engine from the original Lätkäzombit game, but if the setup works nicely, it could be used further (and for example contain the editor project as well).

The setup is (probably) messy, suggestions/contributions are welcome!

The monorepo uses the following dependencies:
 * Node.js and npm
 * [Conventional Commits](https://www.conventionalcommits.org/), [commitlint](https://commitlint.js.org/) and [commitlint-plugin-tense](https://github.com/actuallydamo/commitlint-plugin-tense)
 * husky

### KiiGame Adventure Engine

[KiiGame Adventure Engine](kiigame) is a HTML5/JavaScript based simple adventure game engine for web browsers. KGAE uses:

 * TypeScript
 * [Konva](https://konvajs.org)
 * Mocha, Chai and Sinon.JS for unit tests
 * [InversifyJS](https://inversify.io/) for dependency injection
 * rollup for bundling
 * [Semantic Versioning](https://semver.org/)

### Lätkäzombit

[Lätkäzombit: Pako hallista](latkazombit) serves as the reference/example game for KGAE. [Try Lätkäzombit: Pako hallista here!](https://kgae.netlify.app/) The game is in the Finnish language.

### Other stuff

There is an editor to create games using KGAE: check out [kged here](https://github.com/kiigame/kged).

Take a look at the adventure creation guide: https://github.com/evktalo/kiigame/wiki/Adventure-creation-guide

## Development

* Install Node.js and npm (for example see https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* Clone the repository
* Run the following to install dependencies and set up project configurations:

```
npm install
npm run prepare
```

### Committing

Note that husky runs typecheck and tests for each package, and for those to run, the engine needs to be built first.

```
cd kiigame
npm run build
```

### Testing

To run the reference game, you need to bundle the engine first:

```
cd kiigame
npm run build
```

Then bundle the game itself and launch the local web server:

```
cd ../latkazombit
npm run build-dev
npm start
```

Navigate to `127.0.0.1:8080` in your browser - Lätkäzombit should launch.

## Contributing

Contributions are welcome!

Disclaimer: This project is at the moment very much a hobby project with fairly specific but mostly undocumented aims and goals.

### Branching strategy

* Start a branch from `main` branch with a descriptive name
* Create a pull request towards `main`
