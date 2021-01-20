/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {App} from "../../lib/cm-web-modules/app-deprecated/App.js"
import {MessageBroker} from "../../lib/cm-web-modules/message-broker/MessageBroker.js"
import {COLOR} from "../../lib/cm-chessboard/Chessboard.js"
import {ChessConsoleState} from "./ChessConsoleState.js"
import {I18n} from "../../lib/cm-web-modules/i18n/I18n.js"
import {FEN} from "../../lib/cm-chess/Chess.js"

export const consoleMessageTopics = {
    /** @deprecated */
    newGame: "game/new",
    initGame: "game/init",
    gameOver: "game/over",
    moveRequest: "game/moveRequest",
    legalMove: "game/move/legal",
    illegalMove: "game/move/illegal",
    moveUndone: "game/move/undone",
    load: "game/load"
}
// @deprecated, may be deleted in future versions, use `consoleMessageTopics`
export const messageBrokerTopics = consoleMessageTopics

export class ChessConsole extends App {

    constructor(container, player, opponent, props = {}) {
        super(props)
        this.props = {
            locale: navigator.language, // locale for i18n
            playerColor: COLOR.white, // the players color (color at bottom)
            pgn: undefined // initial pgn, can contain header and history
        }
        if (!this.props.figures) {
            const whitePiecesStyle = 'color: white; text-shadow: 1px  1px 1px black, 1px -1px 1px black, -1px  1px 1px black, -1px -1px 1px black;'
            const blackPiecesStyle = 'color: black; text-shadow: 1px  1px 1px white, 1px -1px 1px white, -1px  1px 1px white, -1px -1px 1px white;'
            this.props.figures = {
                Rw: '<i class="fas fa-fw fa-chess-rook" style="' + whitePiecesStyle + '"></i>',
                Nw: '<i class="fas fa-fw fa-chess-knight" style="' + whitePiecesStyle + '"></i>',
                Bw: '<i class="fas fa-fw fa-chess-bishop" style="' + whitePiecesStyle + '"></i>',
                Qw: '<i class="fas fa-fw fa-chess-queen" style="' + whitePiecesStyle + '"></i>',
                Kw: '<i class="fas fa-fw fa-chess-king" style="' + whitePiecesStyle + '"></i>',
                Pw: '<i class="fas fa-fw fa-chess-pawn" style="' + whitePiecesStyle + '"></i>',
                Rb: '<i class="fas fa-fw fa-chess-rook" style="' + blackPiecesStyle + '"></i>',
                Nb: '<i class="fas fa-fw fa-chess-knight" style="' + blackPiecesStyle + '"></i>',
                Bb: '<i class="fas fa-fw fa-chess-bishop" style="' + blackPiecesStyle + '"></i>',
                Qb: '<i class="fas fa-fw fa-chess-queen" style="' + blackPiecesStyle + '"></i>',
                Kb: '<i class="fas fa-fw fa-chess-king" style="' + blackPiecesStyle + '"></i>',
                Pb: '<i class="fas fa-fw fa-chess-pawn" style="' + blackPiecesStyle + '"></i>'
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
        this.container = container
        this.i18n = new I18n({locale: props.locale})
        this.messageBroker = new MessageBroker()
        this.state = new ChessConsoleState(this.props)
        this.container.innerHTML = this.props.template
        this.componentContainers = {
            center: this.container.querySelector(".chess-console-center"),
            left: this.container.querySelector(".chess-console-left"),
            right: this.container.querySelector(".chess-console-right"),
            board: this.container.querySelector(".chess-console-board"), // TODO put selector inside the components
            controlButtons: this.container.querySelector(".control-buttons"),
            notifications: this.container.querySelector(".chess-console-notifications")
        }

        this.player = new player.type(this, player.name, player.props)
        this.opponent = new opponent.type(this, opponent.name, opponent.props)

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

    /** @deprecated use initGame() */
    newGame(props = {}) {
        console.warn("newGame is deprecated, use initGame")
        this.initGame(props)
        this.messageBroker.publish(consoleMessageTopics.newGame, {props: props})
    }

    initGame(props = {}) {
        Object.assign(this.props, props)
        this.state.orientation = this.props.playerColor
        if(props.pgn) {
            this.state.chess.loadPgn(props.pgn, {sloppy: true})
            this.state.plyViewed = this.state.plyCount
        } else if (props.history) {
            this.state.chess.loadPgn(props.history, {sloppy: true})
            this.state.plyViewed = this.state.plyCount
        } else {
            this.state.chess.load(FEN.start)
            this.state.plyViewed = 0
        }
        this.messageBroker.publish(consoleMessageTopics.initGame, {props: props})
        this.nextMove()
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
                    this.moveResponse(san)
                })
            })
        }
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
            if(this.props.debug) {
                console.warn("illegalMove", this.state.chess, move)
            }
            this.messageBroker.publish(consoleMessageTopics.illegalMove, {
                playerMoved: playerMoved,
                move: move
            })
            playerMoved.moveResult(move, moveResult)
            return
        }
        if (this.state.plyViewed === this.state.plyCount - 1) {
            this.state.plyViewed++
        }
        this.messageBroker.publish(consoleMessageTopics.legalMove, {
            playerMoved: playerMoved,
            move: move,
            moveResult: moveResult
        })
        playerMoved.moveResult(move, moveResult)
        if (!this.state.chess.gameOver()) {
            this.nextMove()
        } else {
            let wonColor = null
            if (this.state.chess.inCheckmate()) {
                wonColor = (this.state.chess.turn() === COLOR.white) ? COLOR.black : COLOR.white
            }
            this.messageBroker.publish(consoleMessageTopics.gameOver, {wonColor: wonColor})
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
        this.messageBroker.publish(consoleMessageTopics.moveUndone)
        this.nextMove()
    }

}