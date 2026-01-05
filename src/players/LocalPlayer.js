/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */
import {COLOR, INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {Chess} from "chess.mjs/src/Chess.js"
import {ChessConsolePlayer} from "../ChessConsolePlayer.js"
import {CONSOLE_MESSAGE_TOPICS} from "../ChessConsole.js"
import {PremoveManager} from "./PremoveManager.js"

export class LocalPlayer extends ChessConsolePlayer {

    constructor(chessConsole, name, props) {
        super(chessConsole, name)
        this.props = {
            allowPremoves: false
        }
        Object.assign(this.props, props)
        this.premoveManager = new PremoveManager(chessConsole)
    }

    /**
     * Validates a move and handles pawn promotion.
     * @param {string} fen - Current position FEN
     * @param {string} squareFrom - Source square
     * @param {string} squareTo - Target square
     * @param {Function} callback - Called with move result or null
     * @returns {boolean} True if move is valid or promotion dialog shown
     */
    validateMoveAndPromote(fen, squareFrom, squareTo, callback) {
        const tmpChess = new Chess(fen)
        const move = {from: squareFrom, to: squareTo}
        const moveResult = tmpChess.move(move)

        if (moveResult) {
            callback(moveResult)
            return true
        }

        // Check for promotion
        const piece = tmpChess.get(squareFrom)
        if (piece && piece.type === "p") {
            const possibleMoves = tmpChess.moves({square: squareFrom, verbose: true})
            for (const possibleMove of possibleMoves) {
                if (possibleMove.to === squareTo && possibleMove.promotion) {
                    this.showPromotionDialog(squareTo, tmpChess.turn(), move, tmpChess, callback)
                    return true
                }
            }
        }

        callback(null)
        return false
    }

    /**
     * Shows promotion dialog and executes move with selected piece.
     */
    showPromotionDialog(square, color, move, chess, callback) {
        const chessboard = this.chessConsole.components.board.chessboard
        chessboard.showPromotionDialog(square, color, (event) => {
            if (event.piece) {
                move.promotion = event.piece.charAt(1)
                callback(chess.move(move))
            } else {
                callback(null)
            }Mak
        })
    }

    /**
     * Handles move input events from cm-chessboard.
     * @param {Object} event - Input event from chessboard
     * @param {Function} moveResponse - Callback to report move result
     */
    chessboardMoveInputCallback(event, moveResponse) {
        const isPlayerTurn = this.chessConsole.playerToMove() === this

        if (isPlayerTurn) {
            return this.handlePlayerMove(event, moveResponse)
        } else {
            return this.handlePremove(event)
        }
    }

    /**
     * Handles move when it's the player's turn.
     */
    handlePlayerMove(event, moveResponse) {
        if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
            const gameFen = this.chessConsole.state.chess.fen()
            return this.validateMoveAndPromote(gameFen, event.squareFrom, event.squareTo, (moveResult) => {
                let result
                if (moveResult) {
                    result = moveResponse(moveResult)
                } else {
                    result = moveResponse({from: event.squareFrom, to: event.squareTo})
                    this.premoveManager.clearQueue()
                }
                if (result && !this.props.allowPremoves) {
                    this.chessConsole.components.board.chessboard.disableMoveInput()
                }
            })
        }

        if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
            return this.handleMoveInputStarted(event)
        }
    }

    /**
     * Handles the start of move input - validates if piece can be moved.
     */
    handleMoveInputStarted(event) {
        // If viewing history, jump to current position
        if (this.chessConsole.state.plyViewed !== this.chessConsole.state.chess.plyCount()) {
            this.chessConsole.state.plyViewed = this.chessConsole.state.chess.plyCount()
            return false
        }

        const possibleMoves = this.chessConsole.state.chess.moves({square: event.square})
        if (possibleMoves.length > 0) {
            return true
        }

        this.chessConsole.messageBroker.publish(CONSOLE_MESSAGE_TOPICS.illegalMove, {
            move: {from: event.squareFrom}
        })
        return false
    }

    /**
     * Handles move input when it's not the player's turn (premove).
     */
    handlePremove(event) {
        if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
            this.premoveManager.add(event)
        }
        return true
    }

    /**
     * Called when it's this player's turn to move.
     * @param {string} fen - Current position FEN
     * @param {Function} moveResponse - Callback to report move result
     */
    moveRequest(fen, moveResponse) {
        this.premoveManager.initContextMenu()

        if (this.chessConsole.state.chess.gameOver()) {
            return
        }

        // Execute queued premove
        if (this.premoveManager.hasPremoves()) {
            const premoveEvent = this.premoveManager.shift()
            setTimeout(() => {
                this.chessboardMoveInputCallback(premoveEvent, moveResponse)
            }, 20)
            return
        }

        // Enable normal move input
        const chessboard = this.chessConsole.components.board.chessboard
        if (!chessboard.isMoveInputEnabled()) {
            const color = this.chessConsole.state.chess.turn() === 'w' ? COLOR.white : COLOR.black
            chessboard.enableMoveInput(
                (event) => this.chessboardMoveInputCallback(event, moveResponse),
                color
            )
        }
    }
}
