/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {consoleMessageTopics} from "../ChessConsole.js"
import {COLOR} from "../../../lib/cm-chess/Chess.js"
import {Component} from "../../../lib/cm-web-modules/app/Component.js"

export class Persistence extends Component {

    constructor(chessConsole, props) {
        super(props)
        this.chessConsole = chessConsole
        if(!this.props.savePrefix) {
            this.props.savePrefix = "ChessConsole"
        }
        this.chessConsole.state.observeChess(() => {
            this.save()
        })
        this.chessConsole.persistence = this
    }

    load(prefix = this.props.savePrefix) {
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

    loadValue(valueName, prefix = this.props.savePrefix) {
        let item = null
        try {
            item = localStorage.getItem(prefix + valueName)
            return JSON.parse(item)
        } catch (e) {
            console.error("error loading ", prefix + valueName)
            console.error("item:" + item)
            console.error(e)
        }
    }

    save(prefix = this.props.savePrefix) {
        localStorage.setItem(prefix + "PlayerColor", JSON.stringify(this.chessConsole.props.playerColor))
        localStorage.setItem(prefix + "Pgn", this.chessConsole.state.chess.renderPgn())
    }

    saveValue(valueName, value, prefix = this.props.savePrefix) {
        localStorage.setItem(prefix + valueName, JSON.stringify(value))
    }
}