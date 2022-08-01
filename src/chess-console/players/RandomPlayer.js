/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {ChessConsolePlayer} from "../ChessConsolePlayer.js"
import {Chess} from "../../../lib/chess.mjs/Chess.js"

export class RandomPlayer extends ChessConsolePlayer {

    constructor(chessConsole, name, props = {}) {
        super(chessConsole, name, props)
        this.chess = new Chess()
        this.props.delay = 1000
        console.log("props", this.props, props)
        Object.assign(this.props, props)
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    moveRequest(fen, moveResponse) {
        setTimeout(() => {
            this.chess.load(fen)
            const possibleMoves = this.chess.moves({verbose: true})
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[this.random(0, possibleMoves.length - 1)]
                moveResponse({from: randomMove.from, to: randomMove.to})
            }
        }, this.props.delay)
    }
}
