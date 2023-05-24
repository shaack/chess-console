/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "cm-web-modules/src/observe/Observe.js"
import {UiComponent} from "cm-web-modules/src/app/Component.js"
import {COLOR} from "cm-chess/src/Chess.js"
import {DomUtils} from "cm-web-modules/src/utils/DomUtils.js"
import {ChessRender} from "../tools/ChessRender.js"

export class History extends UiComponent {

    constructor(chessConsole, props) {
        super(chessConsole.componentContainers.left.querySelector(".chess-console-history"), props)
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

    redraw() {
        window.clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            const history = this.chessConsole.state.chess.history()
            let sanWhite
            let sanBlack
            let output = ""
            let i
            let rowClass = ""
            let whiteClass = ""
            let blackClass = ""
            for (i = 0; i < history.length; i += 2) {
                const moveWhite = history[i]
                if (moveWhite) {
                    sanWhite = ChessRender.san(moveWhite.san, COLOR.white, this.chessConsole.i18n.lang, this.props.notationType, this.chessConsole.props.figures)
                }
                const moveBlack = history[i + 1]
                if (moveBlack) {
                    sanBlack = ChessRender.san(moveBlack.san, COLOR.black, this.chessConsole.i18n.lang, this.props.notationType, this.chessConsole.props.figures)
                } else {
                    sanBlack = ""
                }
                if (this.chessConsole.state.plyViewed < i + 1) {
                    whiteClass = "text-muted"
                }
                if(this.chessConsole.state.plyViewed === i + 1) {
                    whiteClass = "active"
                }
                if (this.chessConsole.state.plyViewed < i + 2) {
                    blackClass = "text-muted"
                }
                if(this.chessConsole.state.plyViewed === i + 2) {
                    blackClass = "active"
                }
                output += "<tr><td class='num " + rowClass + "'>" + (i / 2 + 1) + ".</td><td data-ply='" + (i + 1) + "' class='ply " + whiteClass + " ply" + (i + 1) + "'>" + sanWhite + "</td><td data-ply='" + (i + 2) + "' class='ply " + blackClass + " ply" + (i + 2) + "'>" + sanBlack + "</td></tr>"
            }
            this.element.innerHTML = "<h2 class='visually-hidden'>" + this.i18n.t("game_history") + "</h2>" +
                "<table>" + output + "</table>"
            if (this.chessConsole.state.plyViewed > 0) {
                const $ply = $(this.element).find('.ply' + this.chessConsole.state.plyViewed)
                if ($ply.position()) {
                    this.element.scrollTop = 0
                    this.element.scrollTop = ($ply.position().top - 68)
                }
            }
        })
    }
}
