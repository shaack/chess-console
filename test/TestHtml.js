/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {html} from "../src/utils/html.js"

describe("TestHtml", () => {

    it("should interpolate values", () => {
        assert.equal(html`<p>${"hi"}</p>`, "<p>hi</p>")
    })

    it("should join arrays", () => {
        const items = ["a", "b", "c"]
        assert.equal(
            html`<ul>${items.map((x) => `<li>${x}</li>`)}</ul>`,
            "<ul><li>a</li><li>b</li><li>c</li></ul>")
    })

    it("should render null and undefined as an empty string", () => {
        assert.equal(html`a${null}b${undefined}c`, "abc")
    })

    it("should keep 0 and false as values", () => {
        assert.equal(html`${0}-${false}`, "0-false")
    })

})
