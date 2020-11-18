/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AudioSprite} from "../../../lib/cm-web-modules/audio/AudioSprite.js"
import {Component} from "../../../lib/cm-web-modules/app-deprecated/Component.js"
import {consoleMessageTopics} from "../ChessConsole.js"

export class Sound extends Component {

    constructor(chessConsole) {
        super(chessConsole)
        this.chessConsole = chessConsole
        if(!chessConsole.props.soundSpriteFile) {
            chessConsole.props.soundSpriteFile = "/assets/sounds/chess_console_sounds.mp3"
        }
        this.audioSprite = new AudioSprite(chessConsole.props.soundSpriteFile,
            {
                gain: 1,
                slices: {
                    "game_start": {offset: 0, duration: 0.9},
                    "game_won": {offset: 0.9, duration: 1.8},
                    "game_lost": {offset: 2.7, duration: 0.9},
                    "game_draw": {offset: 9.45, duration: 1.35},
                    "check": {offset: 3.6, duration: 0.45},
                    "wrong_move": {offset: 4.05, duration: 0.45},
                    "move": {offset: 4.5, duration: 0.45},
                    "capture": {offset: 6.3, duration: 0.45},
                    "castle": {offset: 7.65, duration: 0.45},
                    "take_back": {offset: 8.1, duration: 0.45},
                    "promotion": {offset: 9.0, duration: 0.45},
                    "dialog": {offset: 10.8, duration: 0.45}
                }
            })
        chessConsole.messageBroker.subscribe(consoleMessageTopics.newGame, () => {
            this.play("game_start")
        })
        chessConsole.messageBroker.subscribe(consoleMessageTopics.legalMove, (data) => {
            const chess = this.chessConsole.state.chess
            const flags = data.moveResult.flags
            if (flags.indexOf("p") !== -1) {
                this.play("promotion")
            } else if (flags.indexOf("c") !== -1) {
                this.play("capture")
            } else if (flags.indexOf("k") !== -1 || flags.indexOf("q") !== -1) {
                this.play("castle")
            } else {
                this.play("move")
            }
            if (chess.inCheck() || chess.inCheckmate()) {
                this.play("check")
            }
        })
        chessConsole.messageBroker.subscribe(consoleMessageTopics.illegalMove, () => {
            this.play("wrong_move")
        })
        chessConsole.messageBroker.subscribe(consoleMessageTopics.moveUndone, () => {
            this.play("take_back")
        })
        chessConsole.messageBroker.subscribe(consoleMessageTopics.gameOver, (data) => {
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