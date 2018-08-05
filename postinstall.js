/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * License: MIT, see file 'LICENSE'
 */

const WebModuleLinker = require("web-module-linker")

const linker = new WebModuleLinker(__dirname)

linker.symlinkModuleSrc("svjs-app")
linker.symlinkModuleSrc("svjs-utils")
linker.symlinkModuleSrc("svjs-i18n")
linker.symlinkModuleSrc("svjs-message-broker")
linker.symlinkModuleSrc("svjs-svg")
linker.symlinkModuleSrc("svjs-observe")
linker.symlinkModuleSrc("svjs-audio")

linker.symlinkModuleSrc("cm-chessboard")
linker.symlinkModuleSrc("cm-chesstools")

linker.symlinkModuleSrc("bootstrap-show-modal", "bootstrap-show-modal.js")
