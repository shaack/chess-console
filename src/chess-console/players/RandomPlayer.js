/**
 * Author: shaack
 * Date: 21.12.2017
 */

import {ChessConsolePlayer} from "../ChessConsolePlayer.js"

export class RandomPlayer extends ChessConsolePlayer {

    constructor(name, chessConsole) {
        super(name, chessConsole)
        this.chess = new Chess()
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
        }, 500)
    }
}