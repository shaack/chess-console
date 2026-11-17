/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {PremoveManager} from "../src/players/PremoveManager.js"
import {mockConsole} from "./mocks/ConsoleMock.js"

describe("TestPremoveManager", () => {

    it("should set, report and take a premove", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        assert.equal(pm.hasPremove(), false)

        pm.set({squareFrom: "e2", squareTo: "e4"})
        assert.equal(pm.hasPremove(), true)

        const premove = pm.take()
        assert.equal(premove.squareFrom, "e2")
        assert.equal(premove.squareTo, "e4")
        assert.equal(pm.hasPremove(), false)
        assert.equal(pm.take(), null)
    })

    it("should replace an existing premove", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        pm.set({squareFrom: "e2", squareTo: "e4"})
        pm.set({squareFrom: "d2", squareTo: "d4"})
        assert.equal(pm.take().squareTo, "d4")
        assert.equal(pm.hasPremove(), false)
    })

    it("should mark start and target square of the premove", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        pm.set({squareFrom: "e2", squareTo: "e4"})
        const calls = cc.components.board.chessboard.calls
        assert.equal(calls.addMarker.length, 2)
        assert.equal(calls.addMarker[0].square, "e2")
        assert.equal(calls.addMarker[1].square, "e4")
    })

    it("should draw an arrow, if the board has the Arrows extension", () => {
        const cc = mockConsole()
        const chessboard = cc.components.board.chessboard
        const arrows = []
        chessboard.addArrow = (type, from, to) => arrows.push({type, from, to})
        chessboard.removeArrows = () => arrows.length = 0
        cc.components.board.props.arrows = {premove: "premoveArrow"}
        const pm = new PremoveManager(cc)
        pm.set({squareFrom: "e2", squareTo: "e4"})
        assert.equal(arrows.length, 1)
        assert.equal(arrows[0].from + arrows[0].to, "e2e4")
        pm.set({squareFrom: "d2", squareTo: "d4"})
        assert.equal(arrows.length, 1)
        assert.equal(arrows[0].from + arrows[0].to, "d2d4")
        pm.clear()
        assert.equal(arrows.length, 0)
    })

    it("should remember the color of the premoved piece", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        pm.set({squareFrom: "e2", squareTo: "e4", chessboard: {getPiece: () => "wp"}})
        assert.equal(pm.premove.color, "w")
    })

    it("clear should remove the premove without touching the board position", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        pm.set({squareFrom: "e2", squareTo: "e4"})
        pm.clear()
        assert.equal(pm.hasPremove(), false)
        assert.equal(cc.components.board.chessboard.calls.setPosition.length, 0)
    })

})
