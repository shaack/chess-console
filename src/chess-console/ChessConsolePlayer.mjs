/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

export class ChessConsolePlayer {

    constructor(chessConsole, name, props) {
        this.chessConsole = chessConsole
        this.name = name
        this.props = props
    }

    /**
     * Called, when the Console requests the next Move from a Player.
     * The Player should answer the moveRequest with a moveResponse.
     * @param fen current position
     * @param moveResponse a callback function to call as the moveResponse. Parameter is an object,
     * containing 'from' and `to`. Example: `moveResponse({from: "e2", to: "e4})`.
     */
    moveRequest(fen, moveResponse) {
    }

    /**
     * Called after valuating the move, if `moveResult` is null, the
     * move is illegal and not executed.
     * @param move
     * @param moveResult
     */
    moveResult(move, moveResult) {
    }

}