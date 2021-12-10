/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * License: MIT, see file 'LICENSE'
 */

const ModRator = require("modrator/src/ModRator.js")
const modRator = new ModRator(__dirname)

modRator.addToLibrary("cm-web-modules")
modRator.addToLibrary("cm-chessboard")
modRator.addToLibrary("cm-pgn")
modRator.addToLibrary("cm-chess")
modRator.addToLibrary("chess.mjs")
modRator.addToLibrary("bootstrap-show-modal", "src", "bootstrap-show-modal.js")
