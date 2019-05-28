/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AudioSprite} from "../../../lib/svjs-audio/AudioSprite.js"
import {Component} from "../../../lib/svjs-app/Component.js"
import {MESSAGE} from "../ChessConsole.js"

export class Sound extends Component {

    constructor(module) {
        super(module)
        if(!module.props.soundSpriteFile) {
            module.props.soundSpriteFile = "/sounds/chess_console_sounds.mp3"
        }
        this.audioSprite = new AudioSprite(module.props.assetsFolder + module.props.soundSpriteFile,
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
        module.messageBroker.subscribe(MESSAGE.gameStarted, () => {
            this.play("game_start")
        })
        module.messageBroker.subscribe(MESSAGE.legalMove, (data) => {
            const chess = this.module.state.chess
            const flags = data.moveResult.flags
            if (flags.indexOf("p") !== -1) {
                this.play("promotion") // todo create promotion sound
            } else if (flags.indexOf("c") !== -1) {
                this.play("capture")
            } else if (flags.indexOf("k") !== -1 || flags.indexOf("q") !== -1) {
                this.play("castle")
            } else {
                this.play("move")
            }
            if (chess.in_check() || chess.in_checkmate()) {
                this.play("check")
            }
        })
        module.messageBroker.subscribe(MESSAGE.illegalMove, () => {
            this.play("wrong_move")
        })
        module.messageBroker.subscribe(MESSAGE.moveUndone, () => {
            this.play("take_back")
        })
        module.messageBroker.subscribe(MESSAGE.gameOver, (data) => {
            setTimeout(() => {
                if(!data.wonColor) {
                    this.play("game_lost")
                } else {
                    if(data.wonColor === this.module.state.playerColor) {
                        this.play("game_won")
                    } else {
                        this.play("game_lost")
                    }
                }
            }, 500)
        })
        module.sound = this
    }

    play(soundName) {
        this.audioSprite.play(soundName)
    }

}