/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../svjs-observe/Observe.js"
import {Chessboard, MOVE_INPUT_MODE} from "../cm-chessboard/Chessboard.js"
import {MESSAGE} from "./ChessConsole.js"

export const MARKER_TYPE = {
    lastMove: {class: "last-move", slice: "marker1"},
    check: {class: "check", slice: "marker2"},
    wrongMove: {class: "wrong-move", slice: "marker1"}
}

export class ChessConsoleView {

    constructor(chessConsole, callback) {
        this.container = chessConsole.container
        this.state = chessConsole.state
        this.render()
        this.elements = {
            chessboard: this.container.querySelector(".chessboard"),
            lastError: this.container.querySelector(".last-error")
        }
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
                chessConsole.messageBroker.subscribe(MESSAGE.illegalMove, (message) => {
                    for (let i = 0; i < 2; i++) {
                        setTimeout(() => {
                            this.chessboard.addMarker(message.move.from, MARKER_TYPE.wrongMove);
                            this.chessboard.addMarker(message.move.to, MARKER_TYPE.wrongMove);
                        }, i * 400);
                        setTimeout(() => {
                            this.chessboard.removeMarkers(null, MARKER_TYPE.wrongMove);
                        }, i * 400 + 200);
                    }
                })
                this.setPositionOfPlyViewed(false)
                callback()
            })
        this.resize()
        window.addEventListener("resize", () => {
            this.resize()
        })
    }

    resize() {
        const width = this.elements.chessboard.offsetWidth
        this.elements.chessboard.style.height = (width * 0.94) + "px"
    }

    render() {
        const colsetConsoleGame = "col-lg-7 order-lg-2 col-md-8 order-md-1 order-sm-1 col-sm-12 order-sm-1"
        const colsetConsoleControls = "col-lg-3 order-lg-3 col-md-4 order-md-2 col-sm-8 order-sm-3"
        const colsetConsoleStatus = "col-lg-2 order-lg-1 order-md-3 col-sm-4 order-sm-2"
        this.container.innerHTML =
            `<div class="row chess-console">
                <div class="console-board ${colsetConsoleGame}">
                    <div class="player top">&nbsp;</div>
                    <div class="chessboard"></div>
                    <div class="player bottom">&nbsp;</div>
                </div>
                <div class="console-controls ${colsetConsoleControls}">
                    <div class="control-icons">
                        <span class="board-control"></span>
                        <span class="game-control"></span>
                    </div>
                    <div class="game-status"></div>
                    <div class="last-error"></div>
                </div>
                <div class="console-status ${colsetConsoleStatus}">
                    <div class="history"></div>
                    <div class="captured-pieces"></div>
                    <div class="engine-status"></div>
                </div>
            </div>`
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