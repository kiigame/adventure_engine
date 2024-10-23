# KiiGame Adventure Engine

![Node CI](https://github.com/kiigame/adventure_engine/actions/workflows/nodejs.yml/badge.svg?branch=main)
[![Netlify Status](https://api.netlify.com/api/v1/badges/697d2167-ec6d-4d1a-98dd-9ae075af4fd5/deploy-status)](https://app.netlify.com/sites/kgae/deploys)

KiiGame Adventure Engine is a HTML5/JavaScript based simple adventure game engine for web browsers. KGAE uses:
 * [Konva](https://konvajs.org)
 * Mocha, Chai and Sinon.JS for unit tests
 * [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and [commitlint](https://commitlint.js.org/#/)
 * [InversifyJS](https://inversify.io/) for dependency injection
 * [Semantic Versioning](https://semver.org/)

The engine comes with an example game, [Lätkäzombit: Pako hallista](https://kgae.netlify.app/). The example game is in the Finnish language.

There is an editor to create games using KGAE: check out [kged here](https://github.com/kiigame/kged).

Take a look at the adventure creation guide: https://github.com/evktalo/kiigame/wiki/Adventure-creation-guide

## Development

WIP

### Branching strategy

* Start a branch from `main` branch with a descriptive name
* Create a pull request towards `main`

### Releases

* `main` branch is tagged for releases
* Maintenance branches can be created for old versions

### How to test locally on Linux

The game is implemented as a web page. Therefore you need to run a web server on your machine to test it locally. Here are the steps:

 * Install and run Apache (for example see https://help.ubuntu.com/community/ApacheMySQLPHP)
 * Install npm (for example see https://www.sitepoint.com/beginners-guide-node-package-manager/)
 * Clone the repository (or just get the files)
 * Run `npm install` to get dependencies
 * Run `npm run dev` to build a development bundle. The bundle is built to the `public/` directory.
 * Put the files (including folders) to your webserver directory (for example `/var/www/`)
 * Open `kiigame.html` in your browser (for example `http://localhost/public/kiigame.html`)

### Running unit tests

After installing with `npm install`, you should be able to run

 * `npm test`
 
in the project root to run the unit tests.

### Building the library bundle

`npm run build` builds the library bundle to `dist/`.
