/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * License: MIT, see file 'LICENSE'
 */

const WebModuleCurator = require("web-module-curator")

const curator = new WebModuleCurator(__dirname)

curator.addModule("svjs-app")
curator.addModule("svjs-utils")
curator.addModule("svjs-i18n")
curator.addModule("svjs-message-broker")
curator.addModule("svjs-svg")
curator.addModule("svjs-observe")
curator.addModule("svjs-audio")

curator.addModule("cm-chessboard")
curator.addModule("cm-chesstools")

curator.addModule("bootstrap-show-modal", "src", "bootstrap-show-modal.js")
