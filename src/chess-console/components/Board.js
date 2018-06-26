/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Chessboard, MOVE_INPUT_MODE} from "../../cm-chessboard/Chessboard.js"
import {MESSAGE} from "../ChessConsole.js"
import {MARKER_TYPE} from "../ChessConsoleView.js"
import {Observe} from "../../svjs-observe/Observe.js"
import {Component} from "../../svjs-app/Component.js"

export class Board extends Component {

    constructor(module, props) {
        super(module, props)
        module.board = this
        this.state = module.state
        this.container = module.container.querySelector(".console-board")
        this.elements = {
            playerTop: document.createElement("div"),
            playerBottom: document.createElement("div"),
            chessboard: document.createElement("div")
        }
        this.elements.playerTop.setAttribute("class", "player top")
        this.elements.playerBottom.setAttribute("class", "player bottom")
        this.elements.chessboard.setAttribute("class", "chessboard")
        this.container.appendChild(this.elements.playerTop)
        this.container.appendChild(this.elements.chessboard)
        this.container.appendChild(this.elements.playerBottom)
        this.resize()
        this.chessboard = new Chessboard(this.elements.chessboard,
            {
                responsive: true,
                position: "empty",
                moveInputMode: MOVE_INPUT_MODE.dragPiece,
                sprite: {
                    url: "./assets/images/chessboard-sprite.svg", // pieces and markers
                }
            }, () => {
                this.state.observeChess((params) => {
                    let animated = true
                    if (params.functionName === "load_pgn") {
                        animated = false
                    }
                    this.setPositionOfPlyViewed(animated)
                    this.markLastMove()
                })
                Observe.property(this.state, "plyViewed", () => {
                    this.setPositionOfPlyViewed()
                    this.markLastMove()
                })
                this.module.messageBroker.subscribe(MESSAGE.illegalMove, (message) => {
                    for (let i = 0; i < 2; i++) {
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
            })
    }

    resize() {
        const width = this.elements.chessboard.offsetWidth
        this.elements.chessboard.style.height = (width * 0.94) + "px"
    }

    setPositionOfPlyViewed(animated = true) {
        this.chessboard.setPosition(this.state.fenOfPly(this.state.plyViewed), animated)
    }

    markLastMove() {
        window.clearTimeout(this.markLastMoveDebounce)
        this.markLastMoveDebounce = setTimeout(() => {
            this.chessboard.removeMarkers(null, MARKER_TYPE.lastMove)
            if (this.state.plyViewed === this.state.ply) {
                const lastMove = this.state.lastMove()
                if (lastMove) {
                    this.chessboard.addMarker(lastMove.from, MARKER_TYPE.lastMove)
                    this.chessboard.addMarker(lastMove.to, MARKER_TYPE.lastMove)
                }
            }
        })
    }

}