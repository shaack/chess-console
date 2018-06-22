/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../svjs-observe/Observe.js"
import {Chessboard, MOVE_INPUT_MODE} from "../cm-chessboard/Chessboard.js"

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
                    console.log("observeChess", params)
                    let animated = true
                    if (params.functionName === "load_pgn") {
                        animated = false
                    }
                    this.setPositionOfPlyViewed(animated)
                    this.markLastMove()
                })
                Observe.property(this.state, "showLastMove", () => {
                    this.markLastMove()
                })
                Observe.property(this.state, "lastError", () => {
                    this.showLastError()
                })
                Observe.property(this.state, "plyViewed", () => {
                    this.setPositionOfPlyViewed()
                    this.markLastMove()
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
        const colsetConsoleGame = "console-game col-lg-7 order-lg-2 col-md-8 order-md-1 order-sm-1 col-sm-12 order-sm-1"
        const colsetConsoleControls = "console-controls col-lg-3 order-lg-3 col-md-4 order-md-2 col-sm-8 order-sm-3"
        const colsetConsoleStatus = "console-status col-lg-2 order-lg-1 order-md-3 col-sm-4 order-sm-2"
        this.container.innerHTML =
            `<div class="row chess-console">
                <div class="${colsetConsoleGame}">
                    <div class="player top">&nbsp;</div>
                    <div class="chessboard"></div>
                    <div class="player bottom">&nbsp;</div>
                </div>
                <div class="${colsetConsoleControls}">
                    <div class="control-icons">
                        <span class="board-control"></span>
                        <span class="game-control"></span>
                    </div>
                    <div class="game-status"></div>
                    <div class="last-error"></div>
                </div>
                <div class="${colsetConsoleStatus}">
                    <div class="history"></div>
                    <div class="captured-pieces"></div>
                    <div class="engine-status"></div>
                </div>
            </div>`
    }

    setPositionOfPlyViewed(animated = true) {
        this.chessboard.setPosition(this.state.fenOfPly(this.state.plyViewed), animated);
    }

}