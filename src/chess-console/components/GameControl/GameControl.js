/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../../../lib/cm-web-modules/app/Component.js"
import {NewGameDialog} from "./NewGameDialog.js"

export class GameControl extends Component {

    constructor(console, props) {
        super(console, props)

        this.console = console
        const i18n = console.i18n
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

            this.$btnUndoMove = $(`<button type="button" title="${i18n.t('undo_move')}" class="btn btn-icon btn-light undoMove"><i class="fa fa-fw fa-undo" aria-hidden="true"></i></button>`)
            this.$btnStartNewGame = $(`<button type="button" title="${i18n.t('start_game')}" class="btn btn-icon btn-light startNewGame"><i class="fa fa-fw fa-plus" aria-hidden="true"></i></button>\`)`)

            console.componentContainers.controlButtons.appendChild(this.$btnUndoMove[0])
            console.componentContainers.controlButtons.appendChild(this.$btnStartNewGame[0])

            this.$btnUndoMove.click(() => {
                this.console.undoMove()
            })
            this.$btnStartNewGame.click(() => {
                this.showNewGameDialog()
            })

            this.console.state.observeChess(() => {
                this.setButtonStates()
            })
            this.setButtonStates()
        })
    }

    showNewGameDialog() {
        new NewGameDialog(this.console, {
            title: this.console.i18n.t('start_game')
        })
    }

    setButtonStates() {
        if (this.console.state.plyCount < 2) {
            this.$btnUndoMove.prop("disabled", true)
        } else {
            this.$btnUndoMove.prop("disabled", false)
        }
    }

}