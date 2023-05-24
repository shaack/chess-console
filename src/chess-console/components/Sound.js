/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AudioSprite} from "cm-web-modules/src/audio/AudioSprite.js"
import {Component} from "cm-web-modules/src/app/Component.js"
import {CONSOLE_MESSAGE_TOPICS} from "../ChessConsole.js"

export class Sound extends Component {

    constructor(chessConsole, props) {
        super(props)
        this.chessConsole = chessConsole
        this.audioSprite = new AudioSprite(this.props.soundSpriteFile,
            {
                gain: 1,
                slices: {
                    "game_start": {offset: 0, duration: 0.9},
                    "game_won": {offset: 0.9, duration: 1.8},
                    "game_lost": {offset: 2.7, duration: 0.9},
                    "game_draw": {offset: 9.45, duration: 1.35},
                    "check": {offset: 3.6, duration: 0.45},
                    "wrong_move": {offset: 4.05, duration: 0.45},
                    "move": {offset: 4.5, duration: 0.2},
                    "capture": {offset: 6.3, duration: 0.2},
                    "castle": {offset: 7.65, duration: 0.2},
                    "take_back": {offset: 8.1, duration: 0.12},
                    "promotion": {offset: 9.0, duration: 0.45},
                    "dialog": {offset: 10.8, duration: 0.45}
                }
            })
        chessConsole.messageBroker.subscribe(CONSOLE_MESSAGE_TOPICS.initGame, () => {
            // this.play("game_start")
        })
        chessConsole.messageBroker.subscribe(CONSOLE_MESSAGE_TOPICS.legalMove, (data) => {
            const chess = this.chessConsole.state.chess
            const flags = data.moveResult.flags
            if (flags.indexOf("p") !== -1) {
                this.play("promotion")
            } else if (flags.indexOf("c") !== -1) {
                this.play("capture")
            } else if (flags.indexOf("k") !== -1 || flags.indexOf("q") !== -1) {
                this.play("castle")
            } else {
                clearInterval(this.moveDebounced)
                this.moveDebounced = setTimeout(() => {
                    this.play("move")
                }, 10)
            }
            if (chess.inCheck() || chess.inCheckmate()) {
                this.play("check")
            }
        })
        chessConsole.messageBroker.subscribe(CONSOLE_MESSAGE_TOPICS.illegalMove, () => {
            this.play("wrong_move")
        })
        chessConsole.messageBroker.subscribe(CONSOLE_MESSAGE_TOPICS.moveUndone, () => {
            this.play("take_back")
        })
        chessConsole.messageBroker.subscribe(CONSOLE_MESSAGE_TOPICS.gameOver, (data) => {
            setTimeout(() => {
                if(!data.wonColor) {
                    this.play("game_lost")
                } else {
                    if(data.wonColor === this.chessConsole.props.playerColor) {
                        this.play("game_won")
                    } else {
                        this.play("game_lost")
                    }
                }
            }, 500)
        })
        chessConsole.sound = this
    }

    play(soundName) {
        this.audioSprite.play(soundName)
    }

}
