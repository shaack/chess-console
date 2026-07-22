/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {FEN, GAME_VARIANT} from "cm-chess/src/Chess.js"
import {LocalPlayer} from "../src/players/LocalPlayer.js"

// A minimal mock ChessConsole, just enough for LocalPlayer.handlePlayerMove().
// The chess logic uses the real chess.mjs via validateMoveAndPromote, so no
// chessboard rendering or DOM is required.
function mockConsole() {
    return {
        state: {
            chess: {
                fen: () => FEN.start,
                turn: () => "w",
                props: {gameVariant: GAME_VARIANT.standard}
            }
        },
        components: {
            board: {
                props: {markers: {premove: {}}},
                chessboard: {
                    removeMarkers: () => {},
                    addMarker: () => {},
                    disableMoveInput: () => {}
                }
            }
        }
    }
}

// A validateMoveInput event as cm-chessboard fires it, with the board attached.
function validateEvent(squareFrom, squareTo, pieceOnTo = null) {
    return {
        type: INPUT_EVENT_TYPE.validateMoveInput,
        squareFrom, squareTo,
        chessboard: {getPiece: (square) => (square === squareTo ? pieceOnTo : null)}
    }
}

describe("TestLocalPlayer", () => {

    // Regression for https://github.com/shaack/chess-console/issues/10
    // Re-selecting an own piece (clicking another own piece while one is
    // selected) makes cm-chessboard probe validateMoveInput(from, ownSquare).
    // That is a re-selection, not an illegal move — chess-console must not
    // answer it with a synthetic move (which the console turns into an
    // illegalMove, playing the wrong-move sound and flashing markers).
    it("should not report a move when re-selecting an own piece", () => {
        const player = new LocalPlayer(mockConsole(), "player", {})
        const responses = []
        // e2 pawn selected, then click own white queen on d1
        player.handlePlayerMove(
            validateEvent("e2", "d1", "wq"),
            (move) => { responses.push(move); return move }
        )
        assert.equal(responses.length, 0)
    })

    // Control: a genuine illegal move (empty destination) must still be reported,
    // so the re-selection guard does not swallow real illegal-move feedback.
    it("should still report a genuine illegal move to an empty square", () => {
        const player = new LocalPlayer(mockConsole(), "player", {})
        const responses = []
        // e2 -> e5 is illegal (pawn can't jump three) and e5 is empty
        player.handlePlayerMove(
            validateEvent("e2", "e5", null),
            (move) => { responses.push(move); return move }
        )
        assert.equal(responses.length, 1)
        assert.equal(responses[0].from, "e2")
        assert.equal(responses[0].to, "e5")
    })

})
