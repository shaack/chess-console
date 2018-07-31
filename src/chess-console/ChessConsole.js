/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AppModule} from "../svjs-app/AppModule.js"
import {MessageBroker} from "../svjs-message-broker/MessageBroker.js"
import {FEN_START_POSITION, COLOR} from "../cm-chessboard/Chessboard.js"
import {ChessConsoleState} from "./ChessConsoleState.js"


export const MESSAGE = {
    gameStarted: function gameStarted() {},
    gameFinished: function gameFinished() {},
    moveRequest: function moveRequest(player) {
        this.player = player
    },
    legalMove: function legalMove(player, move, moveResult) {
        this.player = player
        this.move = move
        this.moveResult = moveResult
    },
    illegalMove: function illegalMove(player, move) {
        this.player = player
        this.move = move
    },
    plyViewed: function plyViewed(plyCount) {
        this.plyCount = plyCount
    }
}

export class ChessConsole extends AppModule {

    constructor(app, container, props = {}) {
        super(app, container, props)
        this.props = {
            assetsFolder: "/assets"
        }
        Object.assign(this.props, props)
        this.messageBroker = new MessageBroker()
        this.state = new ChessConsoleState(this.props)
        this.player = new this.props.player.type(this.props.player.name, this)
        this.opponent = new this.props.opponent.type(this.props.opponent.name, this)
        const colSets = {
            consoleGame: "col-lg-7 order-lg-2 col-md-8 order-md-1 order-sm-1 col-sm-12 order-sm-1",
            consoleControls: "col-lg-3 order-lg-3 col-md-4 order-md-2 col-sm-8 order-sm-3",
            consoleStatus: "col-lg-2 order-lg-1 order-md-3 col-sm-4 order-sm-2"
        }
        this.container.innerHTML =
            `<div class="row chess-console">
                <div class="chess-console-board ${colSets.consoleGame}">
                </div>
                <div class="chess-console-controls ${colSets.consoleControls}">
                    <div class="control-buttons flex-buttons">
                    </div>
                </div>
                <div class="chess-console-status ${colSets.consoleStatus}">
                </div>
            </div>`
        this.componentContainers = {
            board: this.container.querySelector(".chess-console-board"),
            controls: this.container.querySelector(".chess-console-controls"),
            controlButtons: this.container.querySelector(".chess-console-controls .control-buttons"),
            status: this.container.querySelector(".chess-console-status")
        }
    }

    startGame(playerColor) {
        this.state.playerColor = playerColor
        this.nextMove()
    }

    playerWhite() {
        return this.state.playerColor === COLOR.white ? this.player : this.opponent
    }

    playerBlack() {
        return this.state.playerColor === COLOR.white ? this.opponent : this.player
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
        const playerToMove = this.playerToMove()
        this.messageBroker.publish(new MESSAGE.moveRequest(playerToMove))
        setTimeout(() => {
            playerToMove.moveRequest(this.state.chess.fen(), (san) => {
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
        const playerToMove = this.playerToMove()
        if (!moveResult) {
            this.messageBroker.publish(new MESSAGE.illegalMove(playerToMove, move))
            return
        }
        if (this.state.plyViewed === this.state.plyCount() - 1) {
            this.state.plyViewed++
        }
        // this.opponentOf(this.playerToMove()).legalMove(this.state.lastMove())
        this.messageBroker.publish(new MESSAGE.legalMove(playerToMove, move, moveResult))
        if (!this.state.chess.game_over()) {
            this.nextMove()
        }
    }

}