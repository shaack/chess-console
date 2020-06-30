/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../../lib/cm-web-modules/observe/Observe.js"
import {COLOR} from "../../lib/cm-chessboard/Chessboard.js"
import {Chess} from "../../lib/cm-chess/Chess.js"
// import {ChessJs} from "../../lib/cm-chess/ChessJs.js"

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
        let tmpChess = new Chess()
        let history = this.chess.history({verbose: true})
        if (history.length === plyCount) {
            return this.chess.fen()
        }
        for (let i = 0; i < Math.min(plyCount, history.length); i++) {
            tmpChess.move(history[i])
        }
        return tmpChess.fen()
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