/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */
import {Component} from "../../../lib/cm-web-modules/app/Component.js"

export class GameStateOutput extends Component {

    constructor(console) {
        super(console)

        this.console = console
        this.i18n = console.i18n
        this.i18n.load(
            {
                de: {
                    game_over: "Das Spiel ist beendet",
                    check: "Schach",
                    checkmate: "Schachmatt",
                    draw: "Remis",
                    stalemate: "Patt",
                    threefold_repetition: "Remis durch dreifache Wiederholung"
                },
                en: {
                    game_over: "The game is over",
                    check: "Check",
                    checkmate: "Checkmate",
                    draw: "Remis",
                    stalemate: "Stalemate",
                    threefold_repetition: "Remis by threefold repetition"
                }
            }
        )
        const chess = this.console.state.chess
        this.element = document.createElement("div")
        this.element.setAttribute("class", "gameState text-info mb-2")
        this.console.componentContainers.notifications.appendChild(this.element)

        this.console.state.observeChess(() => {
            let html = ''
            if (chess.game_over()) {
                html += `<b>${this.i18n.t("game_over")}</b><br/>`
                if (chess.in_checkmate()) {
                    html += `${this.i18n.t("checkmate")}`
                } else if (chess.in_stalemate()) {
                    html += `${this.i18n.t("stalemate")}`
                } else if (chess.in_threefold_repetition()) {
                    html += `${this.i18n.t("threefold_repetition")}`
                } else if (chess.in_draw()) {
                    html += `${this.i18n.t("draw")}`
                }
            } else if (chess.in_check()) {
                html = `${this.i18n.t("check")}`
            } else {
                html = ""
            }
            this.element.innerHTML = `${html}`
        })
    }

}