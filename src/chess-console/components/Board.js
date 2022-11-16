/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Chessboard, COLOR} from "../../../lib/cm-chessboard/Chessboard.js"
import {consoleMessageTopics} from "../ChessConsole.js"
import {Observe} from "../../../lib/cm-web-modules/observe/Observe.js"
import {UiComponent} from "../../../lib/cm-web-modules/app/Component.js"
import {FEN} from "../../../lib/cm-chessboard/model/Position.js"

export const CONSOLE_MARKER_TYPE = {
    moveToMarker: {class: "markerFrame", slice: "markerFrame"},
    moveFromMarker: {class: "markerFrame", slice: "markerFrame"},
    lastMove: {class: "markerFrame", slice: "markerFrame"},
    check: {class: "markerCircleRed", slice: "markerCircle"},
    wrongMove: {class: "markerFrameRed", slice: "markerFrame"},
    premove: {class: "markerFramePremove", slice: "markerFrame"},
}

export class Board extends UiComponent {

    constructor(chessConsole, props = {}) {
        super(chessConsole.componentContainers.board, props)
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
            const chessboardProps = {
                responsive: true,
                position: FEN.empty,
                orientation: chessConsole.state.orientation,
                accessible: chessConsole.props.accessible, // TODO use accessibility extension
                style: {
                    aspectRatio: 0.94,
                    moveToMarker: CONSOLE_MARKER_TYPE.moveToMarker,
                    moveFromMarker: CONSOLE_MARKER_TYPE.moveFromMarker
                },
                sprite: {
                    url: chessConsole.props.figuresSpriteFile,
                },
                extensions: props.extensions ? props.extensions : []
            }
            if (this.props.style) {
                Object.assign(chessboardProps.style, this.props.style)
            }
            this.chessboard = new Chessboard(this.elements.chessboard, chessboardProps)

            Observe.property(chessConsole.state, "orientation", () => {
                this.setPlayerNames()
                this.chessboard.setOrientation(chessConsole.state.orientation)
                this.markPlayerToMove()
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
                if(message.move.from) {
                    this.chessboard.addMarker(CONSOLE_MARKER_TYPE.wrongMove, message.move.from)
                } else {
                    console.warn("illegalMove without `message.move.from`")
                }
                if(message.move.to) {
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
            this.chessboard.setPosition(to, animated).then(() => {
                this.chessboard.removeMarkers(CONSOLE_MARKER_TYPE.moveFromMarker)
                this.chessboard.removeMarkers(CONSOLE_MARKER_TYPE.moveToMarker)
            })
        })
    }

    markLastMove() {
        window.clearTimeout(this.markLastMoveDebounce)
        this.markLastMoveDebounce = setTimeout(() => {
            this.chessboard.removeMarkers(CONSOLE_MARKER_TYPE.lastMove)
            this.chessboard.removeMarkers(CONSOLE_MARKER_TYPE.check)
            if (this.chessConsole.state.plyViewed === this.chessConsole.state.chess.plyCount()) {
                const lastMove = this.chessConsole.state.chess.lastMove()
                if (lastMove) {
                    this.chessboard.addMarker(CONSOLE_MARKER_TYPE.lastMove, lastMove.from)
                    this.chessboard.addMarker(CONSOLE_MARKER_TYPE.lastMove, lastMove.to)
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
