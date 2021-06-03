/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Chessboard, COLOR} from "../../../../lib/cm-chessboard/Chessboard.js"
import {consoleMessageTopics} from "../../ChessConsole.js"
import {Observe} from "../../../../lib/cm-web-modules/observe/Observe.js"
import {Component} from "../../../../lib/cm-web-modules/app-deprecated/Component.js"

export const MARKER_TYPE = {
    lastMove: {class: "last-move", slice: "markerFrame"},
    check: {class: "check", slice: "markerCircle"},
    wrongMove: {class: "wrong-move", slice: "markerFrame"}
}

export class Board extends Component {

    constructor(chessConsole, props) {
        super(chessConsole, props)
        if (!chessConsole.props.chessboardSpriteFile) {
            chessConsole.props.chessboardSpriteFile = "/assets/images/chessboard-sprite.svg"
        }
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
            chessConsole.componentContainers.board.appendChild(this.elements.playerTop)
            chessConsole.componentContainers.board.appendChild(this.elements.chessboard)
            chessConsole.componentContainers.board.appendChild(this.elements.playerBottom)
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
            const props = {
                responsive: true,
                position: "empty",
                orientation: chessConsole.state.orientation,
                style: {
                    aspectRatio: 0.94,
                    moveMarker: MARKER_TYPE.lastMove,
                    hoverMarker: MARKER_TYPE.lastMove
                },
                sprite: {
                    url: chessConsole.props.chessboardSpriteFile, // pieces and markers
                }
            }
            if (chessConsole.props.chessboardStyle) {
                Object.assign(props.style, chessConsole.props.chessboardStyle)
            }
            this.chessboard = new Chessboard(this.elements.chessboard, props)
            Observe.property(chessConsole.state, ["orientation"], () => {
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
            this.chessboard.initialization.then(() => {
                this.chessConsole.messageBroker.subscribe(consoleMessageTopics.illegalMove, (message) => {
                    this.chessboard.addMarker(message.move.from, MARKER_TYPE.wrongMove)
                    this.chessboard.addMarker(message.move.to, MARKER_TYPE.wrongMove)
                    setTimeout(() => {
                        this.chessboard.removeMarkers(null, MARKER_TYPE.wrongMove)
                    }, 500)
                })
                this.setPositionOfPlyViewed(false)
                this.setPlayerNames()
                this.markPlayerToMove()
                resolve()
            })
        })
    }

    setPositionOfPlyViewed(animated = true) {
        clearTimeout(this.setPositionOfPlyViewedDebounced)
        this.setPositionOfPlyViewedDebounced = setTimeout(() => {
            const to = this.chessConsole.state.fenOfPly(this.chessConsole.state.plyViewed)
            this.chessboard.setPosition(to, animated)
        })
    }

    markLastMove() {
        window.clearTimeout(this.markLastMoveDebounce)
        this.markLastMoveDebounce = setTimeout(() => {
            this.chessboard.removeMarkers(null, MARKER_TYPE.lastMove)
            this.chessboard.removeMarkers(null, MARKER_TYPE.check)
            if (this.chessConsole.state.plyViewed === this.chessConsole.state.plyCount) {
                const lastMove = this.chessConsole.state.lastMove()
                if (lastMove) {
                    this.chessboard.addMarker(lastMove.from, MARKER_TYPE.lastMove)
                    this.chessboard.addMarker(lastMove.to, MARKER_TYPE.lastMove)
                }
                if (this.chessConsole.state.chess.inCheck() || this.chessConsole.state.chess.inCheckmate()) {
                    const kingSquare = this.chessConsole.state.chess.pieces("k", this.chessConsole.state.chess.turn())[0]
                    this.chessboard.addMarker(kingSquare.square, MARKER_TYPE.check)
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