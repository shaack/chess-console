/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AppModule} from "../svjs-app/AppModule.js"
import {MessageBroker} from "../svjs-message-broker/MessageBroker.js"
import {COLOR} from "../cm-chessboard/Chessboard.js"
import {ChessConsoleState} from "./ChessConsoleState.js"
import {ChessConsoleView} from "./ChessConsoleView.js"


export const MESSAGE = {
    constructed: function (console) {
        this.console = console
    },
    gameStarted: function (console) {
        this.console = console
    },
    gameFinished: function (console) {
        this.console = console
    },
    illegalMove: function (console, player, move) {
        this.console = console
        this.player = player
        this.move = move
    },
    moveDone: function (console, move) {
        this.console = console
        this.move = move
    }
}

export class ChessConsole extends AppModule {

    constructor(container, props, components) {
        super(container, props)
        Object.assign(this.components, components)
        this.messageBroker = new MessageBroker()
        this.state = new ChessConsoleState()
        this.state.chess.load(props.position)
        this.view = new ChessConsoleView(this, () => {
            this.player = new props.player.type(props.player.name, this)
            this.opponent = new props.opponent.type(props.opponent.name, this)
            this.nextMove()
        })
        this.messageBroker.publish(new MESSAGE.constructed(this))
    }

    playerWhite() {
        return this.props.playerColor === COLOR.white ? this.player : this.opponent
    }

    playerBlack() {
        return this.props.playerColor === COLOR.white ? this.opponent : this.player
    }

    playerToMove() {
        if (this.state.chess.turn() === "w") {
            return this.playerWhite()
        } else {
            return this.playerBlack()
        }
    }

    opponentOf(player) {
        if (this.player === player) {
            return this.opponent
        } else if (this.opponent === player) {
            return this.player
        } else {
            console.error("player not in game", player)
            return null
        }
    }

    /*
     * - calls `moveRequest()` in next player
     */
    nextMove() {
        setTimeout(() => {
            this.playerToMove().moveRequest(this.state.chess.fen(), (san) => {
                this.moveResponse(san)
            })
        })

    }

    /*
     * - validates move
     * - calls moveDone() in player
     * - requests nextMove
     */
    moveResponse(move) {
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            console.warn("illegal move", move)
            this.messageBroker.publish(new MESSAGE.illegalMove(this, move))
            return
        }
        if (this.state.plyViewed === this.state.ply - 1) {
            this.state.plyViewed++
        }
        this.opponentOf(this.playerToMove()).moveDone(this.state.lastMove())
        this.messageBroker.publish(new MESSAGE.moveDone(this, move))
        if (!this.state.chess.game_over()) {
            this.nextMove()
        }
    }

    /*
     * called, when an illegal move occurred
     */
    illegalMove(move) {
        // todo this must be done in view
        /*
        this.state.lastError = move
        window.clearTimeout(this.illegalMoveDebounce)

        this.illegalMoveDebounce = setTimeout(() => {
            this.model.lastError = null
        }, 10000)
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                this.chessboard.addMarker(move.from, MARKER_TYPE.wrongMove);
                this.chessboard.addMarker(move.to, MARKER_TYPE.wrongMove);
            }, i * 400);
            setTimeout(() => {
                this.chessboard.removeMarkers(null, MARKER_TYPE.wrongMove);
            }, i * 400 + 200);
        }
        */
    }
}