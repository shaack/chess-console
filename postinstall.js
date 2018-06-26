/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * License: MIT, see file 'LICENSE'
 */

const fs = require("fs")
const process = require("process")
const path = require("path")

// link dependencies to use ES6 modules out of node_modules
process.chdir('./src')

symlinkModule("svjs-app")
symlinkModule("svjs-utils")
symlinkModule("svjs-message-broker")
symlinkModule("svjs-svg")
symlinkModule("svjs-observe")
symlinkModule("svjs-audio")

symlinkModule("cm-chessboard")
symlinkModule("cm-bootstrap-modal")
symlinkModule("cm-chesstools")

console.log("Please run 'npm install' after every 'npm update'")

function symlinkModule(moduleName) {
    try {
        fs.unlink(moduleName, () => {
            console.log("Creating link to Module", moduleName, "in /src")
            fs.symlinkSync(resolveModulePath(moduleName), moduleName, "dir")
        })
    } catch (e) {
        console.log(e.message)
    }
}

function resolveModulePath(moduleName) {
    try {
        const pathToMainJs = require.resolve(moduleName)
        return pathToMainJs.substr(0, pathToMainJs.lastIndexOf(moduleName) + moduleName.length)
    } catch (e) {
        console.log(e)
        return null
    }
}
