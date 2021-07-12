/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {FEN} from "../../lib/cm-chess/Chess.js"
import {COLOR} from "../../lib/cm-chessboard/Chessboard.js"
import {I18n} from "../../lib/cm-web-modules/i18n/I18n.js"
import {MessageBroker} from "../../lib/cm-web-modules/message-broker/MessageBroker.js"
import {ChessConsoleState} from "./ChessConsoleState.js"
import {Component} from "../../lib/cm-web-modules/app/Component.js"

export const consoleMessageTopics = {
    // newGame: "game/new", // remove this (deprecated)
    initGame: "game/init",
    gameOver: "game/over",
    moveRequest: "game/moveRequest",
    legalMove: "game/move/legal",
    illegalMove: "game/move/illegal",
    moveUndone: "game/move/undone",
    load: "game/load"
}
// @deprecated, may be deleted in future versions, use `consoleMessageTopics`
// export const messageBrokerTopics = consoleMessageTopics

export class ChessConsole extends Component {

    constructor(context, player, opponent, props = {}, app = undefined) {
        super(app, context, props)
        this.props = {
            figuresSpriteFile: undefined,
            locale: navigator.language, // locale for i18n
            playerColor: COLOR.white, // the players color (color at bottom)
            pgn: undefined // initial pgn, can contain header and history
        }
        if (!this.props.figures) {
            this.props.figures = {
                Rw: '<i class="fas fa-fw fa-chess-rook fa-figure-white"></i>',
                Nw: '<i class="fas fa-fw fa-chess-knight fa-figure-white"></i>',
                Bw: '<i class="fas fa-fw fa-chess-bishop fa-figure-white"></i>',
                Qw: '<i class="fas fa-fw fa-chess-queen fa-figure-white"></i>',
                Kw: '<i class="fas fa-fw fa-chess-king fa-figure-white"></i>',
                Pw: '<i class="fas fa-fw fa-chess-pawn fa-figure-white"></i>',
                Rb: '<i class="fas fa-fw fa-chess-rook fa-figure-black"></i>',
                Nb: '<i class="fas fa-fw fa-chess-knight fa-figure-black"></i>',
                Bb: '<i class="fas fa-fw fa-chess-bishop fa-figure-black"></i>',
                Qb: '<i class="fas fa-fw fa-chess-queen fa-figure-black"></i>',
                Kb: '<i class="fas fa-fw fa-chess-king fa-figure-black"></i>',
                Pb: '<i class="fas fa-fw fa-chess-pawn fa-figure-black"></i>'
            }
        }
        const colSets = {
            consoleGame: "col-lg-7 order-lg-2 col-md-8 order-md-1 order-sm-1 col-sm-12 order-sm-1",
            consoleRight: "col-lg-3 order-lg-3 col-md-4 order-md-2 col-sm-8 order-sm-3",
            consoleLeft: "col-lg-2 order-lg-1 order-md-3 col-sm-4 order-sm-2"
        }
        if (!this.props.template) {
            this.props.template =
                `<div class="row chess-console">
                    <div class="chess-console-center ${colSets.consoleGame}">
                        <div class="chess-console-board"></div>
                    </div>
                    <div class="chess-console-right ${colSets.consoleRight}">
                        <div class="control-buttons flex-buttons"></div>
                        <div class="chess-console-notifications"></div>
                    </div>
                    <div class="chess-console-left ${colSets.consoleLeft}">
                    </div>
                </div>`
        }
        Object.assign(this.props, props)
        this.i18n = new I18n({locale: props.locale})
        this.messageBroker = new MessageBroker()
        this.state = new ChessConsoleState(this.props)
        this.context.innerHTML = this.props.template
        this.componentContainers = {
            center: this.context.querySelector(".chess-console-center"),
            left: this.context.querySelector(".chess-console-left"),
            right: this.context.querySelector(".chess-console-right"),
            board: this.context.querySelector(".chess-console-board"),
            controlButtons: this.context.querySelector(".control-buttons"),
            notifications: this.context.querySelector(".chess-console-notifications")
        }

        this.player = new player.type(this, player.name, player.props)
        this.opponent = new opponent.type(this, opponent.name, opponent.props)

        this.initialization = new Promise((resolve => {
            this.i18n.load({
                de: {
                    ok: "OK",
                    cancel: "Abbrechen"
                },
                en: {
                    ok: "OK",
                    cancel: "Cancel"
                }
            }).then(() => {
                resolve(this)
            })
        }))
    }

    initGame(props = {}) {
        Object.assign(this.props, props)
        this.state.orientation = this.props.playerColor
        if(props.pgn) {
            this.state.chess.loadPgn(props.pgn, {sloppy: true})
            this.state.plyViewed = this.state.chess.plyCount()
        } else if (props.history) {
            console.warn("props.history is deprecated, use props.pgn")
            this.state.chess.loadPgn(props.history, {sloppy: true})
            this.state.plyViewed = this.state.chess.plyCount()
        } else {
            this.state.chess.load(FEN.start)
            this.state.plyViewed = 0
        }
        this.nextMove()
        this.messageBroker.publish(consoleMessageTopics.initGame, {props: props})
    }

    // @deprecated use initGame()
    newGame(props = {}) {
        console.warn("newGame is deprecated, use initGame")
        this.initGame(props)
    }

    playerWhite() {
        return this.props.playerColor === COLOR.white ? this.player : this.opponent
    }

    playerBlack() {
        return this.props.playerColor === COLOR.white ? this.opponent : this.player
    }

    playerToMove() {
        if (this.state.chess.gameOver()) {
            return null
        } else {
            if (this.state.chess.turn() === "w") {
                return this.playerWhite()
            } else {
                return this.playerBlack()
            }
        }
    }

    /*
     * - calls `moveRequest()` in next player
     */
    nextMove() {
        const playerToMove = this.playerToMove()
        if (playerToMove) {
            this.messageBroker.publish(consoleMessageTopics.moveRequest, {playerToMove: playerToMove})
            setTimeout(() => {
                playerToMove.moveRequest(this.state.chess.fen(), (san) => {
                    return this.handleMoveResponse(san)
                })
            })
        }
    }

    /*
     * - validates move
     * - calls moveDone() in player
     * - requests nextMove
     */
    handleMoveResponse(move) {
        const playerMoved = this.playerToMove()
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            if(this.props.debug) {
                console.warn("illegalMove", this.state.chess, move)
            }
            this.messageBroker.publish(consoleMessageTopics.illegalMove, {
                playerMoved: playerMoved,
                move: move
            })
            // playerMoved.moveResult(move, moveResult)
            return moveResult
        }
        if (this.state.plyViewed === this.state.chess.plyCount() - 1) {
            this.state.plyViewed++
        }
        this.messageBroker.publish(consoleMessageTopics.legalMove, {
            playerMoved: playerMoved,
            move: move,
            moveResult: moveResult
        })
        // playerMoved.moveResult(move, moveResult)
        if (!this.state.chess.gameOver()) {
            this.nextMove()
        } else {
            let wonColor = null
            if (this.state.chess.inCheckmate()) {
                wonColor = (this.state.chess.turn() === COLOR.white) ? COLOR.black : COLOR.white
            }
            this.messageBroker.publish(consoleMessageTopics.gameOver, {wonColor: wonColor})
        }
        return moveResult
    }

    undoMove() {
        this.state.chess.undo()
        if (this.playerToMove() !== this.player) {
            this.state.chess.undo()
        }
        if (this.state.plyViewed > this.state.chess.plyCount()) {
            this.state.plyViewed = this.state.chess.plyCount()
        }
        this.messageBroker.publish(consoleMessageTopics.moveUndone)
        this.nextMove()
    }

}