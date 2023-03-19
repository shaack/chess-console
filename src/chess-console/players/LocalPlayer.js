/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {ChessConsolePlayer} from "../ChessConsolePlayer.js"
import {COLOR, INPUT_EVENT_TYPE} from "../../../lib/cm-chessboard/Chessboard.js"
import {PromotionDialog} from "./PromotionDialog.js"
import {Chess} from "../../../lib/chess.mjs/Chess.js"

export class LocalPlayer extends ChessConsolePlayer {

    constructor(chessConsole, name, props) {
        super(chessConsole, name, props)
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

    moveInputCallback(event, fen, moveResponse) {
        if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
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
        } else if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
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
