/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {RandomPlayer} from "../src/players/RandomPlayer.js"
import {FEN} from "cm-chess/src/Chess.js"

describe("TestRandomPlayer", () => {

    it("random() should stay within the given range", () => {
        const player = new RandomPlayer({}, "random", {delay: 0})
        for (let i = 0; i < 100; i++) {
            const r = player.random(3, 7)
            assert.true(r >= 3 && r <= 7)
        }
        assert.equal(player.random(5, 5), 5)
    })

    it("moveRequest should answer with a legal move", async () => {
        const player = new RandomPlayer({}, "random", {delay: 0})
        const move = await new Promise((resolve) => {
            player.moveRequest(FEN.start, (m) => resolve(m))
        })
        assert.true(move !== null && move !== undefined)
        assert.equal(move.from.length, 2)
        assert.equal(move.to.length, 2)
    })

})
