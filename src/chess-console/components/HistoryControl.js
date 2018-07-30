/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../../svjs-observe/Observe.js"
import {COLOR} from "../../cm-chessboard/Chessboard.js"
import {Component} from "../../svjs-app/Component.js"
import {I18n} from "../../svjs-i18n/I18n.js"

export class HistoryControl extends Component {
    constructor(module) {
        super(module)

        const i18n = new I18n()
        i18n.load({
            de: {
                "to_game_start": "Zum Spielstart",
                "one_move_back": "Ein Zug zurück",
                "one_move_forward": "Ein Zug weiter",
                "to_last_move": "Zum letzen Zug",
                "auto_run": "Automatisch abspielen",
                "turn_board": "Brett drehen"
            },
            en: {
                "to_game_start": "To game start",
                "one_move_back": "One move back",
                "one_move_forward": "One move forward",
                "to_last_move": "To last move",
                "auto_run": "Auto play",
                "turn_board": "Turn board"
            }
        }).then(() => {
            this.element = document.createElement("span")
            this.element.setAttribute("class", "history-control")
            module.componentContainers.controlButtons.appendChild(this.element)
            const $element = $(this.element)
            $element.html(`<button type="button" title="${i18n.t('to_game_start')}" class="btn btn-icon first"><i class="fa fa-fw fa-fast-backward" aria-hidden="true"></i></button>
                <button type="button" title="${i18n.t('one_move_back')}" class="btn btn-icon back"><i class="fa fa-fw fa-step-backward" aria-hidden="true"></i></button>
                <button type="button" title="${i18n.t('one_move_forward')}" class="btn btn-icon forward"><i class="fa fa-fw fa-step-forward" aria-hidden="true"></i></button>
                <button type="button" title="${i18n.t('to_last_move')}" class="btn btn-icon last"><i class="fa fa-fw fa-fast-forward" aria-hidden="true"></i></button>
                <button type="button" title="${i18n.t('auto_run')}" class="btn btn-icon autoplay"><i class="fa fa-fw fa-play" aria-hidden="true"></i><i class="fa fa-fw fa-stop" aria-hidden="true"></i></button>
                <button type="button" title="${i18n.t('turn_board')}" class="btn btn-icon orientation"><i class="fa fa-fw fa-exchange-alt fa-rotate-90" aria-hidden="true"></i></button>`)
            this.$btnFirst = $element.find(".first")
            this.$btnBack = $element.find(".back")
            this.$btnForward = $element.find(".forward")
            this.$btnLast = $element.find(".last")
            this.$btnAutoplay = $element.find(".autoplay")
            this.$btnOrientation = $element.find(".orientation")

            this.module.state.observeChess(() => {
                this.showButtonStates()
            })
            Observe.property(this.module.state, "plyViewed", () => {
                this.showButtonStates()
            })
            Observe.property(this.module.state, "orientation", () => {
                this.showButtonStates()
            })
            this.$btnFirst.click(() => {
                this.module.state.plyViewed = 0
            })
            this.$btnBack.click(() => {
                this.module.state.plyViewed--
            })
            this.$btnForward.click(() => {
                this.module.state.plyViewed++
            })
            this.$btnLast.click(() => {
                this.module.state.plyViewed = this.module.state.ply
            })
            this.$btnOrientation.click(() => {
                if(this.module.state.gameStarted) {
                    this.module.state.orientation = this.module.state.orientation === COLOR.white ? COLOR.black : COLOR.white
                }
            })
            this.$btnAutoplay.click(() => {
                if (this.autoplay) {
                    clearInterval(this.autoplay)
                    this.autoplay = null

                } else {
                    this.module.state.plyViewed++
                    this.autoplay = setInterval(() => {
                        if (this.module.state.plyViewed >= this.module.state.ply) {
                            clearInterval(this.autoplay)
                            this.autoplay = null
                            this.updatePlayIcon()
                        } else {
                            this.module.state.plyViewed++
                            if (this.module.state.plyViewed >= this.module.state.ply) {
                                clearInterval(this.autoplay)
                                this.autoplay = null
                                this.updatePlayIcon()
                            }
                        }
                    }, 1500)
                }
                this.updatePlayIcon()
            })
            this.showButtonStates()
        })
    }

    updatePlayIcon() {
        const $playIcon = this.$btnAutoplay.find(".fa-play")
        const $stopIcon = this.$btnAutoplay.find(".fa-stop")
        if (this.autoplay) {
            $playIcon.hide()
            $stopIcon.show()
        } else {
            $playIcon.show()
            $stopIcon.hide()
        }
    }

    showButtonStates() {
        window.clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            if (this.module.state.plyViewed > 0) {
                this.$btnFirst.prop('disabled', false)
                this.$btnBack.prop('disabled', false)
            } else {
                this.$btnFirst.prop('disabled', true)
                this.$btnBack.prop('disabled', true)
            }
            if (this.module.state.plyViewed < this.module.state.ply) {
                this.$btnLast.prop('disabled', false)
                this.$btnForward.prop('disabled', false)
                this.$btnAutoplay.prop('disabled', false)
            } else {
                this.$btnLast.prop('disabled', true)
                this.$btnForward.prop('disabled', true)
                this.$btnAutoplay.prop('disabled', true)
            }
            if (this.module.state.orientation !== this.module.state.playerColor) {
                this.$btnOrientation.addClass("btn-active") // todo
            } else {
                this.$btnOrientation.removeClass("btn-active") // todo
            }
            if(this.module.state.gameStarted) {
                this.$btnAutoplay.prop('disabled', false)
                this.$btnOrientation.prop('disabled', false)
            } else {
                this.$btnAutoplay.prop('disabled', true)
                this.$btnOrientation.prop('disabled', true)
            }
        })
        this.updatePlayIcon()
    }
}