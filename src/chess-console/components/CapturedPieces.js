/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {PIECES} from "../../../lib/cm-chesstools/ChessTools.js"
import {Observe} from "../../../lib/cm-web-modules/observe/Observe.js"
import {Component} from "../../../lib/cm-web-modules/app/Component.js"

export class CapturedPieces extends Component {

    constructor(console) {
        super(console)

        this.console = console
        this.element = document.createElement("div")
        this.element.setAttribute("class", "captured-pieces")
        this.console.componentContainers.left.appendChild(this.element)

        this.console.state.observeChess(() => {
            this.redraw()
        })
        Observe.property(this.console.state, "plyViewed", () => {
            this.redraw()
        })
        this.redraw()
    }

    redraw() {
        window.clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            const capturedPiecesWhite = []
            const capturedPiecesWhiteAfterPlyViewed = []
            const capturedPiecesWhiteConditionalMoves = []
            const capturedPiecesBlack = []
            const capturedPiecesBlackAfterPlyViewed = []
            const capturedPiecesBlackConditionalMoves = []

            const history = this.console.state.chess.history({verbose: true})
            $.each(history, (index, move) => {
                if (move.flags === "c" || move.flags === "e") {
                    if (move.color === "b") {
                        if (index < this.console.state.plyViewed) {
                            if (this.console.state.analyseStartIndex && index > this.console.state.analyseStartIndex) {
                                capturedPiecesWhiteConditionalMoves.push(PIECES[move.captured + "w"])
                            } else {
                                capturedPiecesWhite.push(PIECES[move.captured + "w"])
                            }
                        } else {
                            capturedPiecesWhiteAfterPlyViewed.push(PIECES[move.captured + "w"])
                        }
                    } else if (move.color === "w") {
                        if (index < this.console.state.plyViewed) {
                            if (this.console.state.analyseStartIndex && index > this.console.state.analyseStartIndex) {
                                capturedPiecesBlackConditionalMoves.push(PIECES[move.captured + "b"])
                            } else {
                                capturedPiecesBlack.push(PIECES[move.captured + "b"])
                            }
                        } else {
                            capturedPiecesBlackAfterPlyViewed.push(PIECES[move.captured + "b"])
                        }
                    }
                }
            })

            const zeroWithSpace = "&#8203;"
            let output = "<div>"
            if (capturedPiecesWhite.length > 0) {
                output += capturedPiecesWhite.join(zeroWithSpace) // Zero width Space
            }
            if (capturedPiecesWhiteConditionalMoves.length > 0) {
                output += "<span class='text-primary'>" + capturedPiecesWhiteConditionalMoves.join(zeroWithSpace) + "</span>"
            }
            if (capturedPiecesWhiteAfterPlyViewed.length > 0) {
                output += "<span class='text-muted'>" + capturedPiecesWhiteAfterPlyViewed.join(zeroWithSpace) + "</span>"
            }
            output += "</div><div>"
            if (capturedPiecesBlack.length > 0) {
                output += capturedPiecesBlack.join("&#8203;")
            }
            if (capturedPiecesBlackConditionalMoves.length > 0) {
                output += "<span class='text-primary'>" + capturedPiecesBlackConditionalMoves.join(zeroWithSpace) + "</span>"
            }
            if (capturedPiecesBlackAfterPlyViewed.length > 0) {
                output += "<span class='text-muted'>" + capturedPiecesBlackAfterPlyViewed.join(zeroWithSpace) + "</span>"
            }
            output += "</div>"
            this.element.innerHTML = output
        })
    }

}