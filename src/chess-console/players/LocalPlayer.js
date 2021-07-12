/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {ChessConsolePlayer} from "../ChessConsolePlayer.js"
import {COLOR, INPUT_EVENT_TYPE} from "../../../lib/cm-chessboard/Chessboard.js"
import {PromotionDialog} from "../components/Board/PromotionDialog.js"
import {Chess} from "../../../lib/chess.mjs/Chess.js"
import {CONSOLE_MARKER_TYPE} from "../components/Board/Board.js"

export class LocalPlayer extends ChessConsolePlayer {

    constructor(name, chessConsole, props) {
        super(name, chessConsole, props)
    }

    /**
     * The return value returns, if valid or if is promotion.
     * The callback returns the move.
     */
    validateMoveAndPromote(fen, squareFrom, squareTo, callback) {
        const tmpChess = new Chess(fen)
        let move = {from: squareFrom, to: squareTo}
        const moveResult = tmpChess.move(move)
        if (moveResult) {
            callback(moveResult)
            return true
        } else { // is a promotion?
            if (tmpChess.get(squareFrom).type === "p") {
                const possibleMoves = tmpChess.moves({square: squareFrom, verbose: true})
                for (let possibleMove of possibleMoves) {
                    if (possibleMove.to === squareTo && possibleMove.promotion) {
                        new PromotionDialog({
                            color: tmpChess.turn(),
                            spriteUrl: this.chessConsole.props.figuresSpriteFile
                        }, (piece) => {
                            move.promotion = piece
                            callback(tmpChess.move(move))
                        })
                        return true
                    }
                }
            }
        }
        callback(null)
        return false
    }

    /**
     * Handles the events from cm-chessboard
     *
     * INPUT_EVENT_TYPE.moveDone
     * - validates Move, returns false, if not valid
     * - does promotion
     * - calls moveResponse()
     *
     * INPUT_EVENT_TYPE.moveStart
     * - allowed only the right color to move
     */
    moveInputCallback(event, fen, moveResponse) {
        if (event.type === INPUT_EVENT_TYPE.moveDone) {
            // prevent flicker
            this.chessConsole.board.chessboard.addMarker(event.squareFrom, CONSOLE_MARKER_TYPE.lastMove)
            this.chessConsole.board.chessboard.addMarker(event.squareTo, CONSOLE_MARKER_TYPE.lastMove)
            return this.validateMoveAndPromote(fen, event.squareFrom, event.squareTo, (moveResult) => {
                let result
                if (moveResult) { // valid
                    result = moveResponse(moveResult)
                } else { // not valid
                    result = moveResponse({from: event.squareFrom, to: event.squareTo})
                }
                if(result) {
                    this.chessConsole.board.chessboard.disableMoveInput()
                }
            })
        } else if (event.type === INPUT_EVENT_TYPE.moveStart) {
            if (this.chessConsole.state.plyViewed !== this.chessConsole.state.chess.plyCount()) {
                this.chessConsole.state.plyViewed = this.chessConsole.state.chess.plyCount()
                return false
            } else {
                return true
            }
        }
    }

    moveRequest(fen, moveResponse) {
        const color = this.chessConsole.state.chess.turn() === 'w' ? COLOR.white : COLOR.black
        if (!this.chessConsole.state.chess.gameOver()) {
            this.chessConsole.board.chessboard.enableMoveInput(
                (event) => {
                    return this.moveInputCallback(event, fen, moveResponse)
                }, color
            )
        }
    }

}