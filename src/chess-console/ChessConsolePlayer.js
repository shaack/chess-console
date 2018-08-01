/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

export class ChessConsolePlayer {

    constructor(name, chessConsole, props) {
        this.name = name
        this.chessConsole = chessConsole
        this.props = props
    }

    moveRequest(fen, moveResponse) {
    }

    moveDone(move, moveResult) {
    }

}