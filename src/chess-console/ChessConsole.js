/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {App} from "../../lib/cm-web-modules/app/App.js"
import {MessageBroker} from "../../lib/cm-web-modules/message-broker/MessageBroker.js"
import {COLOR} from "../../lib/cm-chessboard/Chessboard.js"
import {ChessConsoleState} from "./ChessConsoleState.js"
import {I18n} from "../../lib/cm-web-modules/i18n/I18n.js"


export const MESSAGE = {
    gameStarted: function gameStarted(gameProps) {
        this.gameProps = gameProps
    },
    gameOver: function gameOver(wonColor) { // w, b, null for draw
        this.wonColor = wonColor
    },
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
    moveUndone: function moveUndone() {
    },
    load: function load() {
    }
}

export class ChessConsole extends App {

    constructor(props = {}) {
        super(props)
        this.props = {
            assetsFolder: "/assets"
        }
        Object.assign(this.props, props)
        this.container = props.container
        this.i18n = new I18n({locale: props.locale})
        this.messageBroker = new MessageBroker()
        this.state = new ChessConsoleState(this.props)
        this.player = new this.props.player.type(this.props.player.name, this, this.props.player.props)
        this.opponent = new this.props.opponent.type(this.props.opponent.name, this, this.props.opponent.props)
        const colSets = {
            consoleGame: "col-lg-7 order-lg-2 col-md-8 order-md-1 order-sm-1 col-sm-12 order-sm-1",
            consoleRight: "col-lg-3 order-lg-3 col-md-4 order-md-2 col-sm-8 order-sm-3",
            consoleLeft: "col-lg-2 order-lg-1 order-md-3 col-sm-4 order-sm-2"
        }
        this.container.innerHTML =
            `<div class="row chess-console">
                <div class="chess-console-board ${colSets.consoleGame}">
                </div>
                <div class="chess-console-right ${colSets.consoleRight}">
                    <div class="control-buttons flex-buttons"></div>
                    <div class="chess-console-output"></div>
                </div>
                <div class="chess-console-left ${colSets.consoleLeft}">
                </div>
            </div>`
        this.componentContainers = {
            board: this.container.querySelector(".chess-console-board"),
            right: this.container.querySelector(".chess-console-right"),
            controlButtons: this.container.querySelector(".chess-console-right .control-buttons"),
            left: this.container.querySelector(".chess-console-left"),
            output: this.container.querySelector(".chess-console-output")
        }
        this.initialization = this.i18n.load({
            de: {
                ok: "OK",
                cancel: "Abbrechen"
            },
            en: {
                ok: "OK",
                cancel: "Cancel"
            }
        })
    }

    addComponent(componentType, props = {}) {
        return new Promise((resolve) => {
            this.initialization.then(() => {
                const component = new componentType(this, props)
                this.components.push(component)
                if (component.initialization) {
                    component.initialization.then(() => {
                        resolve(component)
                    })
                } else {
                    resolve(component)
                }
            })
        })
    }

    startGame(gameProps) {
        this.state.playerColor = gameProps.playerColor
        this.state.orientation = gameProps.playerColor
        this.state.chess.reset()
        this.state.plyViewed = 0
        this.messageBroker.publish(new MESSAGE.gameStarted(gameProps))
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

    undoMove() {
        this.state.chess.undo()
        if (this.playerToMove() !== this.player) {
            this.state.chess.undo()
        }
        if (this.state.plyViewed > this.state.plyCount) {
            this.state.plyViewed = this.state.plyCount
        }
        this.messageBroker.publish(new MESSAGE.moveUndone())
        this.nextMove()
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
        const playerMoved = this.playerToMove()
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            this.messageBroker.publish(new MESSAGE.illegalMove(playerMoved, move))
            playerMoved.moveResult(move, moveResult)
            return
        }
        if (this.state.plyViewed === this.state.plyCount - 1) {
            this.state.plyViewed++
        }
        this.messageBroker.publish(new MESSAGE.legalMove(playerMoved, move, moveResult))
        playerMoved.moveResult(move, moveResult)
        if (!this.state.chess.game_over()) {
            this.nextMove()
        } else {
            let wonColor = null
            if (this.state.chess.in_checkmate()) {
                wonColor = (this.state.chess.turn() === COLOR.white) ? COLOR.black : COLOR.white
            }
            this.messageBroker.publish(new MESSAGE.gameOver(wonColor))
        }
    }

    loadPgn(pgn) {
        this.state.chess.load_pgn(pgn, {sloppy: true})
        this.state.plyViewed = this.state.plyCount
        this.nextMove()
    }

}