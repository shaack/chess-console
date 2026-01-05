/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "cm-web-modules/src/observe/Observe.js"
import {COLOR} from "cm-chessboard/src/Chessboard.js"
import {DomUtils} from "cm-web-modules/src/utils/DomUtils.js"

export class HistoryControl {
    constructor(chessConsole, props = {}) {
        this.context = chessConsole.componentContainers.controlButtons
        this.chessConsole = chessConsole
        const i18n = chessConsole.i18n
        this.props = {
            autoPlayDelay: 1500
        }
        Object.assign(this.props, props)
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

            this.btnFirst = DomUtils.createElement(`<button type="button" title="${i18n.t('to_game_start')}" class="btn btn-link text-black first"><i class="fa fa-fw fa-fast-backward" aria-hidden="true"></i></button>`)
            this.btnBack = DomUtils.createElement(`<button type="button" title="${i18n.t('one_move_back')}" class="btn btn-link text-black back"><i class="fa fa-fw fa-step-backward" aria-hidden="true"></i></button>`)
            this.btnForward = DomUtils.createElement(`<button type="button" title="${i18n.t('one_move_forward')}" class="btn btn-link text-black forward"><i class="fa fa-fw fa-step-forward" aria-hidden="true"></i></button>`)
            this.btnLast = DomUtils.createElement(`<button type="button" title="${i18n.t('to_last_move')}" class="btn btn-link text-black last"><i class="fa fa-fw fa-fast-forward" aria-hidden="true"></i></button>`)
            this.btnAutoplay = DomUtils.createElement(`<button type="button" title="${i18n.t('auto_run')}" class="btn btn-link text-black autoplay"><i class="fa fa-fw fa-play" aria-hidden="true"></i><i class="fa fa-fw fa-stop" aria-hidden="true"></i></button>`)
            this.btnOrientation = DomUtils.createElement(`<button type="button" title="${i18n.t('turn_board')}" class="btn btn-link text-black orientation"><i class="fa fa-fw fa-exchange-alt fa-rotate-90" aria-hidden="true"></i></button>`)

            this.context.appendChild(this.btnFirst)
            this.context.appendChild(this.btnBack)
            this.context.appendChild(this.btnForward)
            this.context.appendChild(this.btnLast)
            this.context.appendChild(this.btnAutoplay)
            this.context.appendChild(this.btnOrientation)

            this.chessConsole.state.observeChess(() => {
                this.setButtonStates()
            })
            Observe.property(this.chessConsole.state, "plyViewed", () => {
                this.setButtonStates()
            })
            Observe.property(this.chessConsole.state, "orientation", () => {
                if (this.chessConsole.state.orientation !== this.chessConsole.props.playerColor) {
                    this.btnOrientation.classList.add("btn-active")
                } else {
                    this.btnOrientation.classList.remove("btn-active")
                }
            })
            this.btnFirst.addEventListener("click", () => {
                this.chessConsole.state.plyViewed = 0
                this.resetAutoPlay()
            })
            this.btnBack.addEventListener("click", () => {
                this.chessConsole.state.plyViewed--
                this.resetAutoPlay()
            })
            this.btnForward.addEventListener("click", () => {
                this.chessConsole.state.plyViewed++
                this.resetAutoPlay()
            })
            this.btnLast.addEventListener("click", () => {
                this.chessConsole.state.plyViewed = this.chessConsole.state.chess.plyCount()
                this.resetAutoPlay()
            })
            this.btnOrientation.addEventListener("click", () => {
                this.chessConsole.state.orientation = this.chessConsole.state.orientation === COLOR.white ? COLOR.black : COLOR.white
            })
            this.btnAutoplay.addEventListener("click", () => {
                if (this.autoplay) {
                    clearInterval(this.autoplay)
                    this.autoplay = null
                } else {
                    this.chessConsole.state.plyViewed++
                    this.autoplay = setInterval(this.autoPlayMove.bind(this), this.props.autoPlayDelay)
                }
                this.updatePlayIcon()
            })
            document.addEventListener('keydown', (e) => {
                if (e.metaKey || e.ctrlKey || e.altKey) {
                    return
                }
                if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
                    return
                }
                if (e.key === "ArrowLeft" || e.key === "j") {
                    if (this.chessConsole.state.plyViewed > 0) {
                        this.chessConsole.state.plyViewed--
                        this.resetAutoPlay()
                        e.preventDefault()
                    }
                } else if (e.key === "ArrowRight" || e.key === "k") {
                    if (this.chessConsole.state.plyViewed < this.chessConsole.state.chess.plyCount()) {
                        this.chessConsole.state.plyViewed++
                        this.resetAutoPlay()
                        e.preventDefault()
                    }
                } else if (e.key === "ArrowUp") {
                    this.chessConsole.state.plyViewed = 0
                    this.resetAutoPlay()
                    e.preventDefault()
                } else if (e.key === "ArrowDown") {
                    this.chessConsole.state.plyViewed = this.chessConsole.state.chess.plyCount()
                    this.resetAutoPlay()
                    e.preventDefault()
                } else if (e.key === "f") {
                    this.chessConsole.state.orientation = this.chessConsole.state.orientation === COLOR.white ? COLOR.black : COLOR.white
                    e.preventDefault()
                } else if (e.key === " ") {
                    if (this.autoplay) {
                        clearInterval(this.autoplay)
                        this.autoplay = null
                    } else {
                        if (this.chessConsole.state.plyViewed < this.chessConsole.state.chess.plyCount()) {
                            this.chessConsole.state.plyViewed++
                            this.autoplay = setInterval(this.autoPlayMove.bind(this), this.props.autoPlayDelay)
                        }
                    }
                    this.updatePlayIcon()
                    e.preventDefault()
                }
            })
            this.setButtonStates()
        })
    }

    resetAutoPlay() {
        if (this.autoplay) {
            clearInterval(this.autoplay)
            this.autoplay = setInterval(this.autoPlayMove.bind(this), this.props.autoPlayDelay)
        }
    }

    autoPlayMove() {
        if (this.chessConsole.state.plyViewed >= this.chessConsole.state.chess.plyCount()) {
            clearInterval(this.autoplay)
            this.autoplay = null
            this.updatePlayIcon()
        } else {
            this.chessConsole.state.plyViewed++
            if (this.chessConsole.state.plyViewed >= this.chessConsole.state.chess.plyCount()) {
                clearInterval(this.autoplay)
                this.autoplay = null
                this.updatePlayIcon()
            }
        }
    }

    updatePlayIcon() {
        const playIcon = this.btnAutoplay.querySelector(".fa-play")
        const stopIcon = this.btnAutoplay.querySelector(".fa-stop")
        if (this.autoplay) {
            playIcon.style.display = "none"
            stopIcon.style.display = ""
        } else {
            playIcon.style.display = ""
            stopIcon.style.display = "none"
        }
    }

    setButtonStates() {
        window.clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            if (this.chessConsole.state.plyViewed > 0) {
                this.btnFirst.disabled = false
                this.btnBack.disabled = false
            } else {
                this.btnFirst.disabled = true
                this.btnBack.disabled = true
            }
            if (this.chessConsole.state.plyViewed < this.chessConsole.state.chess.plyCount()) {
                this.btnLast.disabled = false
                this.btnForward.disabled = false
                this.btnAutoplay.disabled = false
            } else {
                this.btnLast.disabled = true
                this.btnForward.disabled = true
                this.btnAutoplay.disabled = true
            }
        })
        this.updatePlayIcon()
    }
}
