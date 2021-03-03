/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../../../lib/cm-web-modules/app-deprecated/Component.js"
import {NewGameDialog} from "./NewGameDialog.js"

export class GameControl extends Component {

    constructor(chessConsole, props) {
        super(chessConsole, props)

        this.chessConsole = chessConsole
        const i18n = chessConsole.i18n
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

            this.$btnUndoMove = $(`<button type="button" title="${i18n.t('undo_move')}" class="btn btn-icon btn-light undoMove"><i class="fa fa-fw fa-undo-alt" aria-hidden="true"></i></button>`)
            this.$btnStartNewGame = $(`<button type="button" title="${i18n.t('start_game')}" class="btn btn-icon btn-light startNewGame"><i class="fa fa-fw fa-plus" aria-hidden="true"></i></button>\`)`)

            chessConsole.componentContainers.controlButtons.appendChild(this.$btnUndoMove[0])
            chessConsole.componentContainers.controlButtons.appendChild(this.$btnStartNewGame[0])

            this.$btnUndoMove.click(() => {
                this.chessConsole.undoMove()
            })
            this.$btnStartNewGame.click(() => {
                this.showNewGameDialog()
            })

            this.chessConsole.state.observeChess(() => {
                this.setButtonStates()
            })
            this.setButtonStates()
        })
    }

    showNewGameDialog() {
        new NewGameDialog(this.chessConsole, {
            title: this.chessConsole.i18n.t('start_game')
        })
    }

    setButtonStates() {
        if (this.chessConsole.state.plyCount < 2) {
            this.$btnUndoMove.prop("disabled", true)
        } else {
            this.$btnUndoMove.prop("disabled", false)
        }
    }

}