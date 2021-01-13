/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../../lib/cm-web-modules/app-deprecated/Component.js"
import {consoleMessageTopics} from "../ChessConsole.js"
import {COLOR} from "../../../lib/cm-chess/Chess.js"

export class Persistence extends Component {

    constructor(chessConsole) {
        super(chessConsole)
        this.chessConsole = chessConsole
        if(!this.chessConsole.props.savePrefix) {
            this.chessConsole.props.savePrefix = "ChessConsole"
        }
        this.chessConsole.state.observeChess(() => {
            this.save(chessConsole.props.savePrefix)
        })
        this.chessConsole.persistence = this
    }

    load() {
        const prefix = this.chessConsole.props.savePrefix
        const props = {}
        try {
            if (this.loadValue("PlayerColor") !== null) {
                props.playerColor = this.loadValue("PlayerColor")
            } else {
                props.playerColor = COLOR.white
            }
            if (localStorage.getItem(prefix + "Pgn") !== null) {
                props.pgn = localStorage.getItem(prefix + "Pgn")
            }
            this.chessConsole.messageBroker.publish(consoleMessageTopics.load)
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
            item = localStorage.getItem(this.chessConsole.props.savePrefix + valueName)
            return JSON.parse(item)
        } catch (e) {
            console.error("error loading ", this.chessConsole.props.savePrefix + valueName)
            console.error("item:" + item)
            console.error(e)
        }
    }

    save() {
        localStorage.setItem(this.chessConsole.props.savePrefix + "PlayerColor", JSON.stringify(this.chessConsole.props.playerColor))
        localStorage.setItem(this.chessConsole.props.savePrefix + "Pgn", this.chessConsole.state.chess.pgn())
    }

    saveValue(valueName, value) {
        localStorage.setItem(this.chessConsole.props.savePrefix + valueName, JSON.stringify(value))
    }
}