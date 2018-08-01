/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../../svjs-app/Component.js"
import {NewGameDialog} from "./NewGameDialog.js"

export class GameControl extends Component {

    constructor(module) {
        super(module)

        const i18n = module.i18n
        i18n.load({
            de: {
                "start_game": "Ein neues Spiel starten",
                "undo_move": "Zug zurück nehmen"
            },
            en: {
                "start_game": "Start a new game",
                "undo_move": "Undo move"
            }
        }).then(() => {
            this.element = document.createElement("span")
            this.element.setAttribute("class", "game-control")
            module.componentContainers.controlButtons.appendChild(this.element)
            const $element = $(this.element)
            $element.html(`<button type="button" title="${i18n.t('undo_move')}" class="btn btn-icon undoMove"><i class="fa fa-fw fa-undo" aria-hidden="true"></i></button>
                <button type="button" title="${i18n.t('start_game')}" class="btn btn-icon startNewGame"><i class="fa fa-fw fa-plus" aria-hidden="true"></i></button>`)
            this.$btnUndoMove = $element.find(".undoMove")
            this.$btnStartNewGame = $element.find(".startNewGame")

            this.$btnUndoMove.click(() => {
                this.module.undoMove()
            })
            this.$btnStartNewGame.click(() => {
                this.showNewGameDialog()
            })

            this.module.state.observeChess(() => {
                this.setButtonStates()
            })
            this.setButtonStates()
        })
    }

    showNewGameDialog() {
        new NewGameDialog(this.module, {
            title: this.module.i18n.t('start_game')
        })
    }

    setButtonStates() {
        if (this.module.state.plyCount < 2) {
            this.$btnUndoMove.prop("disabled", true)
        } else {
            this.$btnUndoMove.prop("disabled", false)
        }
    }

}