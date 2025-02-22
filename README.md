# KiiGame Adventure Engine

![Node CI](https://github.com/kiigame/adventure_engine/actions/workflows/nodejs.yml/badge.svg?branch=main)
[![Netlify Status](https://api.netlify.com/api/v1/badges/697d2167-ec6d-4d1a-98dd-9ae075af4fd5/deploy-status)](https://app.netlify.com/sites/kgae/deploys)

KiiGame Adventure Engine is a HTML5/JavaScript based simple adventure game engine for web browsers. KGAE uses:
 * Node.js and npm
 * [Konva](https://konvajs.org)
 * Mocha, Chai and Sinon.JS for unit tests
 * [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and [commitlint](https://commitlint.js.org/#/)
 * [InversifyJS](https://inversify.io/) for dependency injection
 * [Semantic Versioning](https://semver.org/)

The engine comes with an example game, [Lätkäzombit: Pako hallista](https://kgae.netlify.app/). The example game is in the Finnish language.

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

### Running unit tests

After installing with `npm install`, you should be able to run

 * `npm test`

in the project root to run the unit tests.

### Local manual testing/playing

 * Run `npm run build-dev` to build a development bundle. The bundle is built to the `public/` directory.
 * Run `npm start` to launch local web server
 * Navigate to `127.0.0.1:8080` in your browser - the example game should launch

### Branching strategy

* Start a branch from `main` branch with a descriptive name
* Create a pull request towards `main`

### Releases

* `main` branch is tagged for releases
* Maintenance branches can be created for old versions

### Building the library bundle

`npm run build` builds the library bundle to `dist/`.
