/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * License: MIT, see file 'LICENSE'
 */

const LibraryManager = require("./node_modules/cm-web-modules/src/LibraryManager.js")
const manager = new LibraryManager(__dirname)

manager.addProject("cm-web-modules")
/*
manager.addModule("svjs-utils")
manager.addModule("svjs-i18n")
manager.addModule("svjs-message-broker")
manager.addModule("svjs-svg")
manager.addModule("svjs-observe")
manager.addModule("svjs-audio")
*/
manager.addProject("cm-chessboard")
manager.addProject("cm-chesstools")

manager.addProject("bootstrap-show-modal", "src", "bootstrap-show-modal.js")
