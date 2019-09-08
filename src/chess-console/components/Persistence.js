/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../../lib/cm-web-modules/app/Component.js"
import {COLOR} from "../../../lib/cm-chesstools/ChessTools.js"
import {messageBrokerTopics} from "../ChessConsole.js"

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
            this.console.messageBroker.publish(messageBrokerTopics.load)
            this.console.initGame(props)
        } catch (e) {
            localStorage.clear()
            console.warn(e)
            this.console.initGame({playerColor: COLOR.white})
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
        localStorage.setItem(this.prefix + "playerColor", JSON.stringify(this.console.props.playerColor))
        localStorage.setItem(this.prefix + "history", this.console.state.chess.pgn())
    }

    saveValue(valueName, value) {
        localStorage.setItem(this.prefix + valueName, JSON.stringify(value))
    }
}