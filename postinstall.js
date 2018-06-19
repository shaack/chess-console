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

function symlinkModule(moduleName) {
    try {
        fs.unlink(moduleName, () => {
            fs.symlinkSync(resolveModulePath(moduleName), moduleName, "dir")
        })
    } catch (e) {
        console.log(e.message)
    }
}

function resolveModulePath(moduleName) {
    try {
        console.log("moduleName", moduleName)
        const pathToMainJs = require.resolve(moduleName)
        console.log(pathToMainJs)
        return pathToMainJs.substr(0, pathToMainJs.lastIndexOf(moduleName) + moduleName.length)
    } catch (e) {
        console.warn("module '" + moduleName + "' not found")
        return null
    }
}
