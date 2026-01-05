/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "cm-web-modules/src/observe/Observe.js"
import {COLOR} from "cm-chess/src/Chess.js"
import {DomUtils} from "cm-web-modules/src/utils/DomUtils.js"
import {ChessRender} from "../tools/ChessRender.js"
import {html} from "../utils/html.js"

export class History {

    constructor(chessConsole, props) {
        this.context = chessConsole.componentContainers.left.querySelector(".chess-console-history")
        this.chessConsole = chessConsole
        this.element = document.createElement("div")
        this.element.setAttribute("class", "history")
        this.context.appendChild(this.element)
        this.props = {
            notationType: "figures",
            makeClickable: true
        }
        Object.assign(this.props, props)
        this.chessConsole.state.observeChess(() => {
            this.redraw()
        })
        Observe.property(chessConsole.state, "plyViewed", () => {
            this.redraw()
        })
        if(this.props.makeClickable) {
            this.addClickEvents()
        }
        this.i18n = chessConsole.i18n
        this.i18n.load({
            "de": {
                "game_history": "Spielnotation"
            },
            "en": {
                "game_history": "Game notation"
            }
        }).then(() => {
            this.redraw()
        })
    }

    addClickEvents() {
        this.clickHandler = DomUtils.delegate(this.element, "click", ".ply", (event) => {
            const ply = parseInt(event.target.getAttribute("data-ply"), 10)
            if(ply <= this.chessConsole.state.chess.history().length) {
                this.chessConsole.state.plyViewed = ply
            }
        })
        this.element.classList.add("clickable")
    }

    removeClickEvents() {
        this.clickHandler.remove()
        this.element.classList.remove("clickable")
    }

    getPlyClass(plyNumber) {
        const plyViewed = this.chessConsole.state.plyViewed
        if (plyViewed === plyNumber) return "active"
        if (plyViewed < plyNumber) return "text-muted"
        return ""
    }

    redraw() {
        window.clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            const history = this.chessConsole.state.chess.history()
            const rows = []

            for (let i = 0; i < history.length; i += 2) {
                const moveNumber = i / 2 + 1
                const whitePly = i + 1
                const blackPly = i + 2

                const moveWhite = history[i]
                const moveBlack = history[i + 1]

                const sanWhite = moveWhite
                    ? ChessRender.san(moveWhite.san, COLOR.white, this.i18n.lang, this.props.notationType, this.chessConsole.props.figures)
                    : ""
                const sanBlack = moveBlack
                    ? ChessRender.san(moveBlack.san, COLOR.black, this.i18n.lang, this.props.notationType, this.chessConsole.props.figures)
                    : ""

                rows.push(html`
                    <tr>
                        <td class="num">${moveNumber}.</td>
                        <td data-ply="${whitePly}" class="ply ${this.getPlyClass(whitePly)} ply${whitePly}">${sanWhite}</td>
                        <td data-ply="${blackPly}" class="ply ${this.getPlyClass(blackPly)} ply${blackPly}">${sanBlack}</td>
                    </tr>
                `)
            }

            this.element.innerHTML = html`
                <h2 class="visually-hidden">${this.i18n.t("game_history")}</h2>
                <table>${rows}</table>
            `

            if (this.chessConsole.state.plyViewed > 0) {
                const plyElement = this.element.querySelector('.ply' + this.chessConsole.state.plyViewed)
                if (plyElement) {
                    this.element.scrollTop = 0
                    this.element.scrollTop = plyElement.offsetTop - 68
                }
            }
        })
    }
}
