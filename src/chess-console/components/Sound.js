/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */
import {AudioSprite} from "../../svjs-audio/AudioSprite.js"
import {Component} from "../../svjs-app/Component.js"

export class Sound extends Component {

    constructor(module) {
        super(module)
        this.audioSprite = new AudioSprite(module.props.assetsFolder + "/sound/chess_sounds.mp3",
            {
                "game_start": {offset: 0, duration: 0.9},
                "game_won": {offset: 0.9, duration: 1.8},
                "game_lost": {offset: 2.7, duration: 0.9},
                "check": {offset: 3.6, duration: 0.45},
                "wrong_move": {offset: 4.05, duration: 0.45},
                "move_1": {offset: 4.5, duration: 0.45},
                "move_2": {offset: 4.95, duration: 0.45},
                "move_3": {offset: 5.4, duration: 0.45},
                "move_4": {offset: 5.85, duration: 0.45},
                "capture_1": {offset: 6.3, duration: 0.45},
                "capture_2": {offset: 6.75, duration: 0.45},
                "capture_3": {offset: 7.2, duration: 0.45},
                "capture_4": {offset: 7.65, duration: 0.45},
                "take_back": {offset: 8.1, duration: 0.45},
                "send_moves": {offset: 8.55, duration: 0.45}
            })
    }



}