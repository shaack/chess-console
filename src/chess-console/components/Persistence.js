/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../svjs-app/Component.js"
import {MESSAGE} from "../ChessConsole.js"
import {COLOR} from "../../cm-chesstools/ChessTools.js"

export class Persistence extends Component {

    constructor(module) {
        super(module)
        this.module.state.observeChess(() => {
            this.save()
        })
    }

    load(user) {
        this.prefix = user + "-"
        try {
            if (localStorage.getItem(this.prefix + "playerColor") !== null) {
                this.module.state.playerColor = JSON.parse(localStorage.getItem(this.prefix + "playerColor"))
            } else {
                console.log("starting new game")
                this.module.startGame(COLOR.white)
            }
            if (localStorage.getItem(this.prefix + "pgn") !== null) {
                this.module.state.chess.load_pgn(localStorage.getItem(this.prefix + "pgn"))
                this.module.state.plyViewed = this.module.state.plyCount()
            }
            this.module.nextMove()
        } catch (e) {
            localStorage.clear()
            console.error(e)
        }
    }

    save() {
        localStorage.setItem(this.prefix + "playerColor", JSON.stringify(this.module.state.playerColor))
        localStorage.setItem(this.prefix + "pgn", this.module.state.chess.pgn())
    }
}