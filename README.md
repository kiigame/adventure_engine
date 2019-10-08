kiigame
=======

KiiGame Adventure Engine is a HTML5/JavaScript based simple adventure game engine for web browsers. KGAE uses [Konva](https://konvajs.org), and Mocha, Chai and Sinon for unit tests.

The engine comes with an example game, Lätkäzombit: Pako hallista. The example game is in the Finnish language.

Take a look at the adventure creation guide: https://github.com/evktalo/kiigame/wiki/Adventure-creation-guide

How to test locally on Linux
----------------------------

The game is implemented as a web page. Therefore you need to run a web server on your machine to test it locally. Here are the steps:

 * Install and run Apache (for example see https://help.ubuntu.com/community/ApacheMySQLPHP)
 * Install npm (for example see https://www.sitepoint.com/beginners-guide-node-package-manager/)
 * Clone the repository (or just get the files)
 * Run npm install to get dependencies
 * Put the files (including folders) to your webserver directory (for example /var/www/)
 * Open the kiigame.html in your browser (for example http://localhost/kiigame.html)

Running unit tests
------------------

After installing with install npm, you should be able to run

 * npm test
 
in the project root to run the unit tests.
