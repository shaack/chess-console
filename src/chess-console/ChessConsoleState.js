/**
 * Author: shaack
 * Date: 21.12.2017
 */

import {Observe} from "../svjs-observe/Observe.js"
import {COLOR} from "../cm-chessboard/Chessboard.js"

export class ChessConsoleState {

    constructor(props) {
        this.chess = new Chess()
        this.gameStarted = false
        this.gameRunning = false
        this.playerColor = COLOR.white
        this.orientation = COLOR.white
        this.plyViewed = 0
        this.ply = 0
        this.lastError = null
    }

    pieces(type = null, color = null) {
        let result = []
        for (let i = 0; i < 64; i++) {
            const square = this.chess.SQUARES[i]
            const piece = this.chess.get(square)
            if (piece !== null) {
                piece.square = square
            }
            if (type === null) {
                if (color === null && piece !== null) {
                    result.push(piece)
                }
            } else if (color === null && piece !== null && piece.type === type) {
                result.push(piece)
            } else if (piece !== null && piece.color === color && piece.type === type) {
                result.push(piece)
            }
        }
        return result
    }

    lastMove() {
        const history = this.chess.history({verbose: true})
        if (history.length > 0) {
            return history[history.length - 1]
        } else {
            return null
        }
    }

    fenOfPly(ply) {
        let tmpChess = new Chess()
        let history = this.chess.history({verbose: true})
        if (history.length === ply) {
            return this.chess.fen()
        }
        for (let i = 0; i < Math.min(ply, history.length); i++) {
            tmpChess.move(history[i])
        }
        return tmpChess.fen()
    }

    observeChess(callback) {
        const chessManipulationMethods = [
            'move', 'clear', 'load', 'load_pgn', 'put', 'remove', 'reset', 'undo'
        ]
        chessManipulationMethods.forEach((methodName) => {
            Observe.postFunction(this.chess, methodName, (params) => {
                this.ply = this.chess.history().length
                callback(params)
            })
        })
    };

}