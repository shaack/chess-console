/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Chessboard, COLOR} from "../../../../lib/cm-chessboard/Chessboard.js"
import {consoleMessageTopics} from "../../ChessConsole.js"
import {Observe} from "../../../../lib/cm-web-modules/observe/Observe.js"
import {Component} from "../../../../lib/cm-web-modules/app/Component.js"

export const CONSOLE_MARKER_TYPE = {
    moveToMarker: {class: "markerFrame", slice: "markerFrame"},
    moveFromMarker: {class: "markerFrame", slice: "markerFrame"},
    lastMove: {class: "markerFrame", slice: "markerFrame"},
    check: {class: "markerCircleRed", slice: "markerCircle"},
    wrongMove: {class: "markerFrameRed", slice: "markerFrame"}
}

export class Board extends Component {

    constructor(chessConsole, props) {
        super(chessConsole, chessConsole.componentContainers.board, props)
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
            Observe.property(this.chessConsole.state, "plyViewed", () => {
                this.setPositionOfPlyViewed()
                this.markLastMove()
            })
            const chessboardProps = {
                responsive: true,
                position: "empty",
                orientation: chessConsole.state.orientation,
                style: {
                    aspectRatio: 0.94,
                    moveFromMarker: CONSOLE_MARKER_TYPE.moveFromMarker,
                    moveToMarker: CONSOLE_MARKER_TYPE.moveToMarker
                },
                sprite: {
                    url: chessConsole.props.figuresSpriteFile,
                }
            }
            if (this.props.style) {
                Object.assign(chessboardProps.style, this.props.style)
            }
            this.chessboard = new Chessboard(this.elements.chessboard, chessboardProps)
            // debouncify redrawMarkers() to prevent flicker
            this.chessboard.view.drawMarkers = function() {
                // noinspection JSUnresolvedVariable
                clearTimeout(this.drawMarkersDebounce)
                this.drawMarkersDebounce = setTimeout(() => {
                    while (this.markersGroup.firstChild) {
                        this.markersGroup.removeChild(this.markersGroup.firstChild)
                    }
                    this.chessboard.state.markers.forEach((marker) => {
                            this.drawMarker(marker)
                        }
                    )
                })
            }
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
                    this.chessboard.addMarker(message.move.from, CONSOLE_MARKER_TYPE.wrongMove)
                } else {
                    console.warn("illegalMove without `message.move.from`")
                }
                if(message.move.to) {
                    this.chessboard.addMarker(message.move.to, CONSOLE_MARKER_TYPE.wrongMove)
                }
                setTimeout(() => {
                    this.chessboard.removeMarkers(undefined, CONSOLE_MARKER_TYPE.wrongMove)
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
                // TODO workaround, fix Promise
                this.chessboard.removeMarkers(undefined, CONSOLE_MARKER_TYPE.moveFromMarker)
                this.chessboard.removeMarkers(undefined, CONSOLE_MARKER_TYPE.moveToMarker)
            })
        })
    }

    markLastMove() {
        window.clearTimeout(this.markLastMoveDebounce)
        this.markLastMoveDebounce = setTimeout(() => {
            this.chessboard.removeMarkers(undefined, CONSOLE_MARKER_TYPE.lastMove)
            this.chessboard.removeMarkers(undefined, CONSOLE_MARKER_TYPE.check)
            if (this.chessConsole.state.plyViewed === this.chessConsole.state.chess.plyCount()) {
                const lastMove = this.chessConsole.state.chess.lastMove()
                if (lastMove) {
                    this.chessboard.addMarker(lastMove.from, CONSOLE_MARKER_TYPE.lastMove)
                    this.chessboard.addMarker(lastMove.to, CONSOLE_MARKER_TYPE.lastMove)
                }
                if (this.chessConsole.state.chess.inCheck() || this.chessConsole.state.chess.inCheckmate()) {
                    const kingSquare = this.chessConsole.state.chess.pieces("k", this.chessConsole.state.chess.turn())[0]
                    this.chessboard.addMarker(kingSquare.square, CONSOLE_MARKER_TYPE.check)
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
            const playerMove = this.chessConsole.playerToMove()
            if (
                this.chessConsole.state.orientation === COLOR.white &&
                playerMove === this.chessConsole.playerWhite() ||
                this.chessConsole.state.orientation === COLOR.black &&
                playerMove === this.chessConsole.playerBlack()) {
                this.elements.playerBottom.classList.add("to-move")
            } else {
                this.elements.playerTop.classList.add("to-move")
            }
        }, 10)
    }

}