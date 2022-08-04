/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../../lib/cm-web-modules/observe/Observe.js"
import {COLOR} from "../../lib/cm-chessboard/Chessboard.js"
import {Chess} from "../../lib/cm-chess/Chess.js"

export class ChessConsoleState {

    constructor(props) {
        this.chess = new Chess() // used to validate moves and keep the history
        this.orientation = props.playerColor || COLOR.white
        this.plyViewed = undefined // the play viewed on the board
    }

    observeChess(callback) {
        const chessManipulationMethods = [
            'move', 'clear', 'load', 'loadPgn', 'put', 'remove', 'reset', 'undo'
        ]
        chessManipulationMethods.forEach((methodName) => {
            Observe.postFunction(this.chess, methodName, (params) => {
                callback(params)
            })
        })
    }

}
