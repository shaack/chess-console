/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../../lib/cm-web-modules/app/Component.js"
import {messageBrokerTopics} from "../ChessConsole.js"
import {COLOR} from "../../../lib/cm-chess/Chess.js"

export class Persistence extends Component {

    constructor(chessConsole) {
        super(chessConsole)
        this.chessConsole = chessConsole
        this.chessConsole.state.observeChess(() => {
            this.save()
        })
        this.chessConsole.persistence = this
    }

    load(saveName) {
        this.prefix = saveName + "-"
        const props = {}
        try {
            if (this.loadValue("playerColor") !== null) {
                props.playerColor = this.loadValue("playerColor")
            } else {
                props.playerColor = COLOR.white
            }
            if (localStorage.getItem(this.prefix + "history") !== null) {
                props.history = localStorage.getItem(this.prefix + "history")
            }
            this.chessConsole.messageBroker.publish(messageBrokerTopics.load)
            this.chessConsole.initGame(props)
        } catch (e) {
            localStorage.clear()
            console.warn(e)
            this.chessConsole.initGame({playerColor: COLOR.white})
        }
    }

    loadValue(valueName) {
        let item = null
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
        localStorage.setItem(this.prefix + "playerColor", JSON.stringify(this.chessConsole.props.playerColor))
        localStorage.setItem(this.prefix + "history", this.chessConsole.state.chess.pgn())
    }

    saveValue(valueName, value) {
        localStorage.setItem(this.prefix + valueName, JSON.stringify(value))
    }
}