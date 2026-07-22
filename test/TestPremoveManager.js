/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {PremoveManager} from "../src/players/PremoveManager.js"
import {mockConsole} from "./mocks/ConsoleMock.js"

describe("TestPremoveManager", () => {

    it("should queue, report and shift premoves", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        assert.equal(pm.hasPremoves(), false)

        pm.add({squareFrom: "e2", squareTo: "e4"})
        assert.equal(pm.hasPremoves(), true)
        assert.equal(pm.queue.length, 1)

        const event = pm.shift()
        assert.equal(event.squareTo, "e4")
        assert.equal(pm.hasPremoves(), false)
    })

    it("should draw a marker for every queued premove", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        pm.add({squareFrom: "e2", squareTo: "e4"})
        pm.add({squareFrom: "d2", squareTo: "d4"})
        const calls = cc.components.board.chessboard.calls
        // every updateMarkers() first clears, then re-adds all queued markers
        assert.true(calls.removeMarkers.length >= 2)
        assert.equal(calls.addMarker[calls.addMarker.length - 1].square, "d4")
    })

    it("clearQueue should empty the queue without resetting the board", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        pm.add({squareTo: "e4"})
        pm.add({squareTo: "d4"})
        pm.clearQueue()
        assert.equal(pm.hasPremoves(), false)
        assert.equal(cc.components.board.chessboard.calls.setPosition.length, 0)
    })

    it("clear should empty the queue and reset the board position", () => {
        const cc = mockConsole()
        const pm = new PremoveManager(cc)
        pm.add({squareTo: "e4"})
        pm.clear()
        assert.equal(pm.hasPremoves(), false)
        assert.equal(cc.components.board.chessboard.calls.setPosition.length, 1)
    })

})
