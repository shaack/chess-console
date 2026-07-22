/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {detect} from "../src/tools/Openings.js"

describe("TestOpenings", () => {

    it("should detect a known opening by its move prefix", () => {
        // Blackmar-Diemer-Gambit
        const opening = detect("d2d4d7d5e2e4d5e4b1c3g8f6f2f3e4f3")
        assert.true(opening !== undefined)
        assert.equal(opening.name_en, "BDG")
    })

    it("should detect an opening even when more moves follow", () => {
        const opening = detect("d2d4d7d5e2e4d5e4b1c3g8f6f2f3e4f3g1f3")
        assert.true(opening !== undefined)
        assert.equal(opening.name_en, "BDG")
    })

    it("should return undefined for an unknown sequence", () => {
        assert.equal(detect("a2a3a7a6"), undefined)
    })

})
