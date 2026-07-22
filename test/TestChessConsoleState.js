/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {ChessConsoleState} from "../src/ChessConsoleState.js"
import {COLOR} from "cm-chessboard/src/Chessboard.js"

describe("TestChessConsoleState", () => {

    it("should default the orientation to white", () => {
        const state = new ChessConsoleState({})
        assert.equal(state.orientation, COLOR.white)
    })

    it("should take the orientation from playerColor", () => {
        const state = new ChessConsoleState({playerColor: COLOR.black})
        assert.equal(state.orientation, COLOR.black)
    })

    it("should start from the standard start position", () => {
        const state = new ChessConsoleState({})
        assert.true(state.chess.fen().startsWith("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"))
    })

    it("observeChess should fire the callback on a move", () => {
        const state = new ChessConsoleState({})
        let fired = 0
        state.observeChess(() => fired++)
        state.chess.move({from: "e2", to: "e4"})
        assert.true(fired > 0)
    })

})
