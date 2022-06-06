/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * License: MIT, see file 'LICENSE'
 */

const ModLib = require("modlib/src/ModLib.js")
const modLib = new ModLib(__dirname)

modLib.add("cm-web-modules")
modLib.add("cm-chessboard")
modLib.add("cm-pgn")
modLib.add("cm-chess")
modLib.add("chess.mjs")
modLib.add("bootstrap-show-modal", "src", "bootstrap-show-modal.js")
