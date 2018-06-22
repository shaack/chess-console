/**
 * Author: shaack
 * Date: 22.12.2017
 */

const fs = require("fs")
const process = require("process")
const path = require("path")

// link dependencies to use ES6 modules out of node_modules
process.chdir('./src')
symlinkModule("cm-chessboard")
symlinkModule("cm-bootstrap-modal")
symlinkModule("svjs-app")
symlinkModule("svjs-svg")
symlinkModule("svjs-observe")
symlinkModule("svjs-audio")

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
        console.warn("module '" + moduleName + "' not found")
        return null
    }
}
