/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */
import {Component} from "../../../lib/svjs-app/Component.js"

export class GameStateOutput extends Component {

    constructor(module) {
        super(module)

        this.i18n = module.i18n
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
                    game_over: "The Game is over",
                    check: "Check",
                    checkmate: "Checkmate",
                    draw: "Remis",
                    stalemate: "Stalemate",
                    threefold_repetition: "Remis by threefold repetition"
                }
            }
        )
        const chess = this.module.state.chess
        this.element = document.createElement("div")
        this.element.setAttribute("class", "gameState text-info")
        this.module.componentContainers.output.appendChild(this.element)

        this.module.state.observeChess(() => {
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
            this.element.innerHTML = `<p>${html}</p>`
        })
    }

}