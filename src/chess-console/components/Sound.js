/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AudioSprite} from "../../svjs-audio/AudioSprite.js"
import {Component} from "../../svjs-app/Component.js"
import {MESSAGE} from "../ChessConsole.js"

export class Sound extends Component {

    constructor(module) {
        super(module)
        this.audioSprite = new AudioSprite(module.props.assetsFolder + "/sound/chess_sounds.mp3",
            {
                slices: {
                    "game_start": {offset: 0, duration: 0.9},
                    "game_won": {offset: 0.9, duration: 1.8},
                    "game_lost": {offset: 2.7, duration: 0.9},
                    "check": {offset: 3.6, duration: 0.45},
                    "wrong_move": {offset: 4.05, duration: 0.45},
                    "move": {offset: 4.5, duration: 0.45},
                    "capture": {offset: 6.3, duration: 0.45},
                    "take_back": {offset: 8.1, duration: 0.45}
                }
            })
        module.messageBroker.subscribe(MESSAGE.gameStarted, () => {
            this.audioSprite.play("game_start")
        })
        module.messageBroker.subscribe(MESSAGE.legalMove, () => {
            this.audioSprite.play("move")
        })
        module.messageBroker.subscribe(MESSAGE.illegalMove, () => {
            this.audioSprite.play("wrong_move")
        })
    }

}