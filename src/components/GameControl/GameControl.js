/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {NewGameDialog} from "./NewGameDialog.js"
import {DomUtils} from "cm-web-modules/src/utils/DomUtils.js"

export class GameControl {

    constructor(chessConsole, props) {
        this.context = chessConsole.componentContainers.controlButtons
        this.chessConsole = chessConsole
        this.props = props

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

            this.btnUndoMove = DomUtils.createElement(`<button type="button" title="${i18n.t('undo_move')}" class="btn btn-icon btn-light undoMove"><i class="fa fa-fw fa-undo-alt" aria-hidden="true"></i></button>`)
            this.btnStartNewGame = DomUtils.createElement(`<button type="button" title="${i18n.t('start_game')}" class="btn btn-icon btn-light startNewGame"><i class="fa fa-fw fa-plus" aria-hidden="true"></i></button>`)

            this.context.appendChild(this.btnUndoMove)
            this.context.appendChild(this.btnStartNewGame)

            this.btnUndoMove.addEventListener("click", () => {
                this.chessConsole.undoMove()
            })
            this.btnStartNewGame.addEventListener("click", () => {
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
        if (this.chessConsole.state.chess.plyCount() < 2) {
            this.btnUndoMove.disabled = true
        } else {
            this.btnUndoMove.disabled = false
        }
    }

}
