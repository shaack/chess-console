/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../svjs-observe/Observe.js"
import {COLOR} from "../cm-chessboard/Chessboard.js"

export class ChessConsolePlayer {

    constructor(name, chessConsole) {
        this.name = name
        /** @var ChessConsole */
        this.chessConsole = chessConsole
        this.topBarElement = chessConsole.container.querySelector(".player.top")
        this.bottomBarElement = chessConsole.container.querySelector(".player.bottom")
        Observe.property(this.chessConsole.view.chessboard.state, "orientation", () => {
            this.redraw()
        })
        this.redraw()
    }

    redraw() {
        clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            const isWhite = this.chessConsole.playerWhite() === this
            if (isWhite && this.chessConsole.view.chessboard.getOrientation() === COLOR.white ||
                !isWhite && this.chessConsole.view.chessboard.getOrientation() === COLOR.black) {
                this.bottomBarElement.innerHTML = (this.name ? this.name : "&nbsp;")
            } else {
                this.topBarElement.innerHTML = (this.name ? this.name : "&nbsp;")
            }
        })
    }

    moveRequest(moveResponse) {
    }

    moveDone(move) {
    }

    newGame(gameConfig) {
    }

    getPlayerColor() {
        return null // return ChessUtils.getPlayerColor(this.chessConsole.config.game, this.name);
    }
}