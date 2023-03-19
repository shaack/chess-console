/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Chessboard, COLOR, INPUT_EVENT_TYPE} from "../../../lib/cm-chessboard/Chessboard.js"
import {consoleMessageTopics} from "../ChessConsole.js"
import {Observe} from "../../../lib/cm-web-modules/observe/Observe.js"
import {UiComponent} from "../../../lib/cm-web-modules/app/Component.js"
import {FEN} from "../../../lib/cm-chessboard/model/Position.js"
import {CoreUtils} from "../../../lib/cm-web-modules/utils/CoreUtils.js"
import {PromotionDialog} from "../../../lib/cm-chessboard/extensions/promotion-dialog/PromotionDialog.js"
import {Markers} from "../../../lib/cm-chessboard/extensions/markers/Markers.js"

export const CONSOLE_MARKER_TYPE = {
    moveInput: {class: "marker-frame", slice: "markerFrame"},
    check: {class: "marker-circle-red", slice: "markerCircle"},
    wrongMove: {class: "marker-frame-red", slice: "markerFrame"},
    premove: {class: "marker-frame-blue", slice: "markerFrame"},
    validMove: {class: "marker-dot", slice: "markerDot"},
    validMoveCapture: {class: "marker-circle", slice: "markerCircle"}
}

class ChessConsoleMarkers extends Markers {
    drawAutoMarkers(event) {
        setTimeout(() => {
            this.removeMarkers(this.autoMarker)
            if (event.type === INPUT_EVENT_TYPE.moveInputStarted ||
                event.type === INPUT_EVENT_TYPE.movingOverSquare) {
                if (event.squareFrom) {
                    this.addMarker(this.autoMarker, event.squareFrom)
                }
                if (event.squareTo) {
                    this.addMarker(this.autoMarker, event.squareTo)
                }
            }
        })
    }
}

export class Board extends UiComponent {

    constructor(chessConsole, props = {}) {
        super(chessConsole.componentContainers.board, props)
        chessConsole.components.board = this // register board component, to allow access to the promotion dialog
        this.initialization = new Promise((resolve) => {
            chessConsole.board = this
            this.chessConsole = chessConsole
            this.elements = {
                playerTop: document.createElement("div"),
                playerBottom: document.createElement("div"),
                chessboard: document.createElement("div")
            }
            this.elements.playerTop.setAttribute("class", "player top")
            this.elements.playerTop.innerHTML = "&nbsp;"
            this.elements.playerBottom.setAttribute("class", "player bottom")
            this.elements.playerBottom.innerHTML = "&nbsp;"
            this.elements.chessboard.setAttribute("class", "chessboard")
            this.context.appendChild(this.elements.playerTop)
            this.context.appendChild(this.elements.chessboard)
            this.context.appendChild(this.elements.playerBottom)
            this.chessConsole.state.observeChess((params) => {
                let animated = true
                if (params.functionName === "load_pgn") {
                    animated = false
                }
                this.setPositionOfPlyViewed(animated)
                this.markLastMove()

            })
            Observe.property(this.chessConsole.state, "plyViewed", (props) => {
                this.setPositionOfPlyViewed(props.oldValue !== undefined)
                this.markLastMove()
            })
            this.props = {
                position: FEN.empty,
                orientation: chessConsole.state.orientation,
                assetsUrl: undefined,
                style: {
                    aspectRatio: 0.94
                },
                markers: {
                    moveInput: CONSOLE_MARKER_TYPE.moveInput,
                    check: CONSOLE_MARKER_TYPE.check,
                    wrongMove: CONSOLE_MARKER_TYPE.wrongMove,
                    premove: CONSOLE_MARKER_TYPE.premove,
                    validMove: CONSOLE_MARKER_TYPE.validMove,
                    validMoveCapture: CONSOLE_MARKER_TYPE.validMoveCapture
                },
                extensions: [{class: PromotionDialog}, {class: ChessConsoleMarkers}]
            }
            CoreUtils.mergeObjects(this.props, props)
            this.chessboard = new Chessboard(this.elements.chessboard, this.props)
            Observe.property(chessConsole.state, "orientation", () => {
                this.setPlayerNames()
                this.chessboard.setOrientation(chessConsole.state.orientation).then(() => {
                    this.markPlayerToMove()
                })
            })
            Observe.property(chessConsole.player, "name", () => {
                this.setPlayerNames()
            })
            Observe.property(chessConsole.opponent, "name", () => {
                this.setPlayerNames()
            })
            chessConsole.messageBroker.subscribe(consoleMessageTopics.moveRequest, () => {
                this.markPlayerToMove()
            })
            this.chessConsole.messageBroker.subscribe(consoleMessageTopics.illegalMove, (message) => {
                if (message.move.from) {
                    this.chessboard.addMarker(CONSOLE_MARKER_TYPE.wrongMove, message.move.from)
                } else {
                    console.warn("illegalMove without `message.move.from`")
                }
                if (message.move.to) {
                    this.chessboard.addMarker(CONSOLE_MARKER_TYPE.wrongMove, message.move.to)
                }
                setTimeout(() => {
                    this.chessboard.removeMarkers(CONSOLE_MARKER_TYPE.wrongMove)
                }, 500)
            })
            this.setPositionOfPlyViewed(false)
            this.setPlayerNames()
            this.markPlayerToMove()

            resolve(this)
        })
    }

    setPositionOfPlyViewed(animated = true) {
        clearTimeout(this.setPositionOfPlyViewedDebounced)
        this.setPositionOfPlyViewedDebounced = setTimeout(() => {
            const to = this.chessConsole.state.chess.fenOfPly(this.chessConsole.state.plyViewed)
            this.chessboard.setPosition(to, animated)
        })
    }

    markLastMove() {
        window.clearTimeout(this.markLastMoveDebounce)
        this.markLastMoveDebounce = setTimeout(() => {
            this.chessboard.removeMarkers(CONSOLE_MARKER_TYPE.moveInput)
            this.chessboard.removeMarkers(CONSOLE_MARKER_TYPE.check)
            if (this.chessConsole.state.plyViewed === this.chessConsole.state.chess.plyCount()) {
                const lastMove = this.chessConsole.state.chess.lastMove()
                if (lastMove) {
                    this.chessboard.addMarker(CONSOLE_MARKER_TYPE.moveInput, lastMove.from)
                    this.chessboard.addMarker(CONSOLE_MARKER_TYPE.moveInput, lastMove.to)
                }
                if (this.chessConsole.state.chess.inCheck() || this.chessConsole.state.chess.inCheckmate()) {
                    const kingSquare = this.chessConsole.state.chess.pieces("k", this.chessConsole.state.chess.turn())[0]
                    this.chessboard.addMarker(CONSOLE_MARKER_TYPE.check, kingSquare.square)
                }
            }
        })
    }

    setPlayerNames() {
        window.clearTimeout(this.setPlayerNamesDebounce)
        this.setPlayerNamesDebounce = setTimeout(() => {
            if (this.chessConsole.props.playerColor === this.chessConsole.state.orientation) {
                this.elements.playerBottom.innerHTML = this.chessConsole.player.name
                this.elements.playerTop.innerHTML = this.chessConsole.opponent.name
            } else {
                this.elements.playerBottom.innerHTML = this.chessConsole.opponent.name
                this.elements.playerTop.innerHTML = this.chessConsole.player.name
            }
        })
    }

    markPlayerToMove() {
        clearTimeout(this.markPlayerToMoveDebounce)
        this.markPlayerToMoveDebounce = setTimeout(() => {
            this.elements.playerTop.classList.remove("to-move")
            this.elements.playerBottom.classList.remove("to-move")
            this.elements.playerTop.classList.remove("not-to-move")
            this.elements.playerBottom.classList.remove("not-to-move")
            const playerMove = this.chessConsole.playerToMove()
            if (
                this.chessConsole.state.orientation === COLOR.white &&
                playerMove === this.chessConsole.playerWhite() ||
                this.chessConsole.state.orientation === COLOR.black &&
                playerMove === this.chessConsole.playerBlack()) {
                this.elements.playerBottom.classList.add("to-move")
                this.elements.playerTop.classList.add("not-to-move")
            } else {
                this.elements.playerTop.classList.add("to-move")
                this.elements.playerBottom.classList.add("not-to-move")
            }
        }, 10)
    }

}
