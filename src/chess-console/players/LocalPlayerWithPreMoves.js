/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 *
 * This Player implements pre moves and uses the PromotionDialog extension of cm-chessboard
 */

import {ChessConsolePlayer} from "../ChessConsolePlayer.js"
import {COLOR, INPUT_EVENT_TYPE} from "../../../lib/cm-chessboard/Chessboard.js"
import {Chess} from "../../../lib/chess.mjs/Chess.js"
import {CONSOLE_MARKER_TYPE} from "../components/Board.js"

export class LocalPlayerWithPreMoves extends ChessConsolePlayer {

    constructor(chessConsole, name, props) {
        super(chessConsole, name, props)
        this.premoves = []
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
            if (tmpChess.get(squareFrom) && tmpChess.get(squareFrom).type === "p") {
                const possibleMoves = tmpChess.moves({square: squareFrom, verbose: true})
                for (let possibleMove of possibleMoves) {
                    if (possibleMove.to === squareTo && possibleMove.promotion) {
                        const chessboard = this.chessConsole.components.board.chessboard
                        setTimeout(() => {
                                chessboard.showPromotionDialog(squareTo, tmpChess.turn(), (event) => {
                                    if(event.piece) {
                                        move.promotion = event.piece.charAt(1)
                                        console.log(move)
                                        callback(tmpChess.move(move))
                                    } else {
                                        callback(null)
                                    }
                                })
                            }
                            , 200)
                        return true
                        /* // Old style bootstrap promotion dialog
                        new PromotionDialog({
                            color: tmpChess.turn(),
                            spriteUrl: this.chessConsole.props.figuresSpriteFile
                        }, (piece) => {
                            move.promotion = piece
                            callback(tmpChess.move(move))
                        })
                        return true
                        */
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
    moveInputCallback(event, ignored, boardFen, moveResponse) {
        // if player can make move, make, if not store as premove
        const gameFen = this.chessConsole.state.chess.fen()
        if (this.chessConsole.playerToMove() === this) {
            if (event.type === INPUT_EVENT_TYPE.moveDone) {
                return this.validateMoveAndPromote(gameFen, event.squareFrom, event.squareTo, (moveResult) => {
                    let result
                    if (moveResult) { // valid
                        result = moveResponse(moveResult)
                    } else { // not valid
                        result = moveResponse({from: event.squareFrom, to: event.squareTo})
                        this.premoves = []
                        this.updatePremoveMarkers()
                    }
                    if (result) {
                        // this.chessConsole.board.chessboard.disableMoveInput()
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
        } else {
            // console.log("premove", event, gameFen, boardFen)
            if (event.type === INPUT_EVENT_TYPE.moveDone) {
                this.premoves.push(event)
                // set markers for the premoves
                this.updatePremoveMarkers()
            }
            return true
        }
    }

    moveRequest(fen, moveResponse) {
        const color = this.chessConsole.state.chess.turn() === 'w' ? COLOR.white : COLOR.black
        if (!this.chessConsole.state.chess.gameOver()) {
            if (this.premoves.length > 0) {
                const eventFromPremovesQueue = this.premoves.shift()
                this.updatePremoveMarkers()
                console.log("premove", eventFromPremovesQueue, fen)
                setTimeout(() => {
                    this.moveInputCallback(eventFromPremovesQueue, fen, this.chessConsole.board.chessboard.getPosition(), moveResponse)
                })
                return true
            }
            // this.chessConsole.board.chessboard.disableMoveInput()
            this.chessConsole.board.chessboard.enableMoveInput(
                (event) => {
                    console.log("normal move", event, fen)
                    return this.moveInputCallback(event, fen, this.chessConsole.board.chessboard.getPosition(), moveResponse)
                }, color
            )
        }
    }

    updatePremoveMarkers() {
        this.chessConsole.board.chessboard.removeMarkers(CONSOLE_MARKER_TYPE.premove)
        for (const premove of this.premoves) {
            this.chessConsole.board.chessboard.addMarker(CONSOLE_MARKER_TYPE.premove, premove.squareTo)
        }
    }

}
