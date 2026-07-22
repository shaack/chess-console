/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {ChessRender, PIECES} from "../src/tools/ChessRender.js"
import {COLOR} from "cm-chessboard/src/Chessboard.js"

describe("TestChessRender", () => {

    it("replaceAll should replace every occurrence", () => {
        assert.equal(ChessRender.replaceAll("Nf3 Nc3", {"N": "K"}), "Kf3 Kc3")
    })

    it("replaceAll should honor the ignoreCase flag", () => {
        assert.equal(ChessRender.replaceAll("aAa", {"a": "b"}, true), "bbb")
        assert.equal(ChessRender.replaceAll("aAa", {"a": "b"}, false), "bAb")
    })

    it("san should render German notation in text mode", () => {
        assert.equal(ChessRender.san("Nf3", COLOR.white, "de", "text"), "Sf3")
        assert.equal(ChessRender.san("Qxd5", COLOR.white, "de", "text"), "Dxd5")
    })

    it("san should render utf8 figures in figures mode", () => {
        assert.equal(ChessRender.san("Nf3", COLOR.white, "en", "figures"), PIECES.figures.utf8.Nw + "f3")
        assert.equal(ChessRender.san("Nf3", COLOR.black, "en", "figures"), PIECES.figures.utf8.Nb + "f3")
    })

})
