/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */
import {Component} from "../../svjs-app/Component.js"
import {MESSAGE} from "../ChessConsole.js"

export class Persistence extends Component {

    constructor(module, props = {}) {
        super(module)
        this.props = {
            prefix: "cc-"
        }
        Object.assign(this.props, props)
        this.load()
        module.messageBroker.subscribe(MESSAGE.moveDone, (player, move, moveResult) => {
            console.log(player, move, moveResult)
            this.save()
        })
    }

    load() {
        try {
            if (localStorage.getItem(this.props.prefix + "playerColor") !== null) {
                this.module.state.playerColor = JSON.parse(localStorage.getItem(this.props.prefix + "playerColor"))
            }
            if (localStorage.getItem(this.props.prefix + "pgn") !== null) {
                this.module.state.chess.load_pgn(localStorage.getItem(this.props.prefix + "pgn"))
            }
        } catch (e) {
            localStorage.clear()
            console.error(e)
        }
    }

    save() {
        localStorage.setItem(this.props.prefix + "playerColor", JSON.stringify(this.module.state.playerColor));
        localStorage.setItem(this.props.prefix + "pgn", this.module.state.chess.pgn());
    }
}