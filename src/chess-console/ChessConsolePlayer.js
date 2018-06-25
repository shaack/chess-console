/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../svjs-observe/Observe.js"
import {COLOR} from "../cm-chessboard/Chessboard.js"

export class ChessConsolePlayer {

    constructor(name, chessConsole) {
        this.name = name
        this.chessConsole = chessConsole
    }

    moveRequest(fen, moveResponse) {
    }

    moveDone(move) {
    }

}