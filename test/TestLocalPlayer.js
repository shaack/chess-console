/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {FEN, Chess} from "cm-chess/src/Chess.js"
import {LocalPlayer} from "../src/players/LocalPlayer.js"
import {CONSOLE_MESSAGE_TOPICS} from "../src/ChessConsole.js"
import {mockConsole} from "./mocks/ConsoleMock.js"

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
        player.handlePlayerMove(
            validateEvent("e2", "d1", "wq"), // e2 pawn selected, click own white queen on d1
            (move) => { responses.push(move); return move })
        assert.equal(responses.length, 0)
    })

    // Control: a genuine illegal move (empty destination) must still be reported.
    it("should still report a genuine illegal move to an empty square", () => {
        const player = new LocalPlayer(mockConsole(), "player", {})
        const responses = []
        player.handlePlayerMove(
            validateEvent("e2", "e5", null), // e2 -> e5 is illegal and e5 is empty
            (move) => { responses.push(move); return move })
        assert.equal(responses.length, 1)
        assert.equal(responses[0].from, "e2")
        assert.equal(responses[0].to, "e5")
    })

    it("validateMoveAndPromote should accept a legal move", () => {
        const player = new LocalPlayer(mockConsole(), "player", {})
        let result
        const ok = player.validateMoveAndPromote(FEN.start, "e2", "e4", (r) => { result = r })
        assert.equal(ok, true)
        assert.true(result !== null && result !== undefined)
    })

    it("validateMoveAndPromote should reject an illegal move", () => {
        const player = new LocalPlayer(mockConsole(), "player", {})
        let result = "unset"
        const ok = player.validateMoveAndPromote(FEN.start, "e2", "e5", (r) => { result = r })
        assert.equal(ok, false)
        assert.equal(result, null)
    })

    it("handleMoveInputStarted should allow starting on a movable piece", () => {
        const cc = mockConsole({chess: new Chess()})
        const player = new LocalPlayer(cc, "player", {})
        assert.equal(player.handleMoveInputStarted({square: "e2"}), true)
        assert.equal(cc.published.length, 0)
    })

    it("handleMoveInputStarted should reject an empty square and report it", () => {
        const cc = mockConsole({chess: new Chess()})
        const player = new LocalPlayer(cc, "player", {})
        const result = player.handleMoveInputStarted({square: "e4", squareFrom: "e4"})
        assert.equal(result, false)
        assert.equal(cc.published.length, 1)
        assert.equal(cc.published[0].topic, CONSOLE_MESSAGE_TOPICS.illegalMove)
    })

    it("should queue a premove when it is not the player's turn", () => {
        const player = new LocalPlayer(mockConsole(), "player", {})
        const result = player.chessboardMoveInputCallback(
            {type: INPUT_EVENT_TYPE.validateMoveInput, squareFrom: "e2", squareTo: "e4"},
            () => {})
        assert.equal(result, true)
        assert.equal(player.premoveManager.hasPremoves(), true)
    })

})
