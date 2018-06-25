/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../svjs-app/Component.js"
import {Observe} from "../../svjs-observe/Observe.js"
import {COLOR} from "../../cm-chessboard/Chessboard.js"
import {MESSAGE} from "../ChessConsole.js"

export class PlayerBars extends Component {

    constructor(module) {
        super(module)
        this.topBarElement = this.module.container.querySelector(".player.top")
        this.bottomBarElement = this.module.container.querySelector(".player.bottom")
        Observe.property(this.module.view.chessboard.state, "orientation", () => {
            this.redraw()
        })
        module.messageBroker.subscribe(MESSAGE.moveRequest, (player) => {
            this.markToMove()
        })
        this.redraw()
    }

    redraw() {
        clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            if (this.module.view.chessboard.getOrientation() === COLOR.white) {
                this.bottomBarElement.innerHTML = this.module.player.name
                this.topBarElement.innerHTML = this.module.opponent.name
            } else {
                this.bottomBarElement.innerHTML = this.module.opponent.name
                this.topBarElement.innerHTML = this.module.player.name
            }
        })
    }

    markToMove() {
        this.topBarElement.classList.remove("to-move")
        this.bottomBarElement.classList.remove("to-move")
        const playerMove = this.module.playerToMove()
        if (
            this.module.view.chessboard.getOrientation() === COLOR.white &&
            playerMove === this.module.playerWhite() ||
            this.module.view.chessboard.getOrientation() === COLOR.black &&
            playerMove === this.module.playerBlack()) {
            this.bottomBarElement.classList.add("to-move")
        } else {
            this.topBarElement.classList.add("to-move")
        }
    }
}