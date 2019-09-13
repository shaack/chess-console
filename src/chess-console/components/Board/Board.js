/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Chessboard, COLOR, MOVE_INPUT_MODE} from "../../../../lib/cm-chessboard/Chessboard.js"
import {messageBrokerTopics} from "../../ChessConsole.js"
import {Observe} from "../../../../lib/cm-web-modules/observe/Observe.js"
import {Component} from "../../../../lib/cm-web-modules/app/Component.js"

export const MARKER_TYPE = {
    lastMove: {class: "last-move", slice: "marker1"},
    check: {class: "check", slice: "marker2"},
    wrongMove: {class: "wrong-move", slice: "marker1"}
}


export class Board extends Component {

    constructor(console, props) {
        super(console, props)
        if(!console.props.chessboardSpriteFile) {
            console.props.chessboardSpriteFile = "/assets/images/chessboard-sprite.svg"
        }
        this.initialization = new Promise((resolve) => {
            console.board = this
            this.console = console
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
            console.componentContainers.board.appendChild(this.elements.playerTop)
            console.componentContainers.board.appendChild(this.elements.chessboard)
            console.componentContainers.board.appendChild(this.elements.playerBottom)
            this.resize()
            this.console.state.observeChess((params) => {
                let animated = true
                if (params.functionName === "load_pgn") {
                    animated = false
                }
                this.setPositionOfPlyViewed(animated)
                this.markLastMove()
            })
            Observe.property(this.console.state, "plyViewed", () => {
                this.setPositionOfPlyViewed()
                this.markLastMove()
            })
            const props = {
                responsive: true,
                position: "empty",
                moveInputMode: MOVE_INPUT_MODE.dragPiece,
                orientation: console.state.orientation,
                sprite: {
                    url: console.props.chessboardSpriteFile, // pieces and markers
                }
            }
            if(console.props.chessboardStyle) {
                props.style = console.props.chessboardStyle
            }
            this.chessboard = new Chessboard(this.elements.chessboard, props)
            Observe.property(console.state, ["orientation"], () => {
                this.setPlayerNames()
                this.chessboard.setOrientation(console.state.orientation)
                this.markPlayerToMove()
            })
            Observe.property(console.player, "name", () => {
                this.setPlayerNames()
            })
            Observe.property(console.opponent, "name", () => {
                this.setPlayerNames()
            })
            console.messageBroker.subscribe(messageBrokerTopics.moveRequest, () => {
                this.markPlayerToMove()
            })
            this.chessboard.initialization.then(() => {
                this.console.messageBroker.subscribe(messageBrokerTopics.illegalMove, (message) => {
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            this.chessboard.addMarker(message.move.from, MARKER_TYPE.wrongMove)
                            this.chessboard.addMarker(message.move.to, MARKER_TYPE.wrongMove)
                        }, i * 400)
                        setTimeout(() => {
                            this.chessboard.removeMarkers(null, MARKER_TYPE.wrongMove)
                        }, i * 400 + 200)
                    }
                })
                this.setPositionOfPlyViewed(false)
                window.addEventListener("resize", () => {
                    this.resize()
                })
                this.setPlayerNames()
                this.markPlayerToMove()
                resolve()
            })
        })
    }

    resize() {
        const width = this.elements.chessboard.offsetWidth
        this.elements.chessboard.style.height = (width * 0.94) + "px"
    }

    setPositionOfPlyViewed(animated = true) {
        clearTimeout(this.setPositionOfPlyViewedDebounced)
        this.setPositionOfPlyViewedDebounced = setTimeout(() => {
            const to = this.console.state.fenOfPly(this.console.state.plyViewed)
            this.chessboard.setPosition(to, animated)
        })
    }

    markLastMove() {
        window.clearTimeout(this.markLastMoveDebounce)
        this.markLastMoveDebounce = setTimeout(() => {
            this.chessboard.removeMarkers(null, MARKER_TYPE.lastMove)
            this.chessboard.removeMarkers(null, MARKER_TYPE.check)
            if (this.console.state.plyViewed === this.console.state.plyCount) {
                const lastMove = this.console.state.lastMove()
                if (lastMove) {
                    this.chessboard.addMarker(lastMove.from, MARKER_TYPE.lastMove)
                    this.chessboard.addMarker(lastMove.to, MARKER_TYPE.lastMove)
                }
                if (this.console.state.chess.in_check() || this.console.state.chess.in_checkmate()) {
                    const kingSquare = this.console.state.pieces("k", this.console.state.chess.turn())[0]
                    this.chessboard.addMarker(kingSquare.square, MARKER_TYPE.check)
                }
            }
        })
    }

    setPlayerNames() {
        window.clearTimeout(this.setPlayerNamesDebounce)
        this.setPlayerNamesDebounce = setTimeout(() => {
            if (this.console.props.playerColor === this.console.state.orientation) {
                this.elements.playerBottom.innerHTML = this.console.player.name
                this.elements.playerTop.innerHTML = this.console.opponent.name
            } else {
                this.elements.playerBottom.innerHTML = this.console.opponent.name
                this.elements.playerTop.innerHTML = this.console.player.name
            }
        })
    }

    markPlayerToMove() {
        clearTimeout(this.markPlayerToMoveDebounce)
        this.markPlayerToMoveDebounce = setTimeout(() => {
            this.elements.playerTop.classList.remove("to-move")
            this.elements.playerBottom.classList.remove("to-move")
            const playerMove = this.console.playerToMove()
            if (
                this.console.state.orientation === COLOR.white &&
                playerMove === this.console.playerWhite() ||
                this.console.state.orientation === COLOR.black &&
                playerMove === this.console.playerBlack()) {
                this.elements.playerBottom.classList.add("to-move")
            } else {
                this.elements.playerTop.classList.add("to-move")
            }
        }, 10)
    }

}