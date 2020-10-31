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
        this.plyViewed = 0 // the play viewed on the board
        this.plyCount = 0 // cache for this.chess.history().length, read only
    }

    lastMove() {
        const history = this.chess.history({verbose: true})
        if (history.length > 0) {
            return history[history.length - 1]
        } else {
            return null
        }
    }

    fenOfPly(plyCount) {
        if(plyCount > 0) {
            return this.chess.history()[plyCount - 1].fen
        } else {
            return this.chess.setUpFen()
        }
    }

    observeChess(callback) {
        const chessManipulationMethods = [
            'move', 'clear', 'load', 'loadPgn', 'put', 'remove', 'reset', 'undo'
        ]
        chessManipulationMethods.forEach((methodName) => {
            Observe.postFunction(this.chess, methodName, (params) => {
                this.plyCount = this.chess.history().length
                callback(params)
            })
        })
    }

}