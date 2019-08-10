/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../../lib/cm-web-modules/app/Component.js"
import {COLOR} from "../../../lib/cm-chesstools/ChessTools.js"
import {MESSAGE} from "../ChessConsole.js"

export class Persistence extends Component {

    constructor(console) {
        super(console)
        this.console = console
        this.console.state.observeChess(() => {
            this.save()
        })
        this.console.persistence = this
    }

    load(saveName) {
        this.prefix = saveName + "-"
        try {
            if (this.loadValue("playerColor") !== null) {
                this.console.state.playerColor = this.loadValue("playerColor")
                this.console.state.orientation = this.console.state.playerColor
            } else {
                this.console.startGame({playerColor: COLOR.white})
            }
            if (localStorage.getItem(this.prefix + "pgn") !== null) {
                this.console.state.chess.load_pgn(localStorage.getItem(this.prefix + "pgn"))
                this.console.state.plyViewed = this.console.state.plyCount
            }
            this.console.messageBroker.publish(new MESSAGE.load())
            this.console.nextMove()
        } catch (e) {
            localStorage.clear()
            console.warn(e)
            this.console.startGame({playerColor: COLOR.white})
        }
    }

    loadValue(valueName) {
        let item
        try {
            item = localStorage.getItem(this.prefix + valueName)
            return JSON.parse(item)
        } catch (e) {
            console.error("error loading ", this.prefix + valueName)
            console.error("item:" + item)
            console.error(e)
        }
    }

    save() {
        localStorage.setItem(this.prefix + "playerColor", JSON.stringify(this.console.state.playerColor))
        localStorage.setItem(this.prefix + "pgn", this.console.state.chess.pgn())
    }

    saveValue(valueName, value) {
        localStorage.setItem(this.prefix + valueName, JSON.stringify(value))
    }
}