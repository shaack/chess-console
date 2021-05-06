/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "../../../lib/cm-web-modules/observe/Observe.js"
import {Component} from "../../../lib/cm-web-modules/app-deprecated/Component.js"
import {PIECES} from "../../../lib/cm-chess/Chess.js"

export class CapturedPieces extends Component {

    constructor(chessConsole) {
        super(chessConsole)

        this.chessConsole = chessConsole
        this.element = document.createElement("div")
        this.element.setAttribute("class", "captured-pieces")
        this.chessConsole.componentContainers.left.appendChild(this.element)

        this.chessConsole.state.observeChess(() => {
            this.redraw()
        })
        Observe.property(this.chessConsole.state, "plyViewed", () => {
            this.redraw()
        })
        this.redraw()
    }

    redraw() {
        window.clearTimeout(this.redrawDebounce)
        this.redrawDebounce = setTimeout(() => {
            const capturedPiecesWhite = []
            const capturedPiecesWhiteAfterPlyViewed = []
            const capturedPiecesBlack = []
            const capturedPiecesBlackAfterPlyViewed = []

            const history = this.chessConsole.state.chess.history({verbose: true})
            let pointsWhite = 0
            let pointsBlack = 0
            $.each(history, (index, move) => {
                if (move.flags.indexOf("c") !== -1 || move.flags.indexOf("e") !== -1) {
                    const pieceCaptured = move.captured.toUpperCase()
                    if (move.color === "b") {
                        if (index < this.chessConsole.state.plyViewed) {
                            capturedPiecesWhite.push(this.chessConsole.props.figures[pieceCaptured + "w"])
                        } else {
                            capturedPiecesWhiteAfterPlyViewed.push(this.chessConsole.props.figures[pieceCaptured + "w"])
                        }
                        pointsWhite += PIECES[pieceCaptured.toLowerCase()].value
                    } else if (move.color === "w") {
                        if (index < this.chessConsole.state.plyViewed) {
                            capturedPiecesBlack.push(this.chessConsole.props.figures[pieceCaptured + "b"])
                        } else {
                            capturedPiecesBlackAfterPlyViewed.push(this.chessConsole.props.figures[pieceCaptured + "b"])
                        }
                        pointsBlack += PIECES[pieceCaptured.toLowerCase()].value
                    }
                }
            })
            if(pointsWhite === 0) {
                pointsWhite = ""
            }
            if(pointsBlack === 0) {
                pointsBlack = ""
            }
            const zeroWithSpace = "&#8203;"
            let output = "<div>"
            if (capturedPiecesWhite.length > 0) {
                output += capturedPiecesWhite.join(zeroWithSpace) // Zero width Space
            }
            if (capturedPiecesWhiteAfterPlyViewed.length > 0) {
                output += "<span class='text-muted'>" + capturedPiecesWhiteAfterPlyViewed.join(zeroWithSpace) + "</span>"
            }
            output += "<small> " + pointsWhite + "</small></div><div>"
            if (capturedPiecesBlack.length > 0) {
                output += capturedPiecesBlack.join("&#8203;")
            }
            if (capturedPiecesBlackAfterPlyViewed.length > 0) {
                output += "<span class='text-muted'>" + capturedPiecesBlackAfterPlyViewed.join(zeroWithSpace) + "</span>"
            }
            output += "<small> " + pointsBlack + "</small></div>"
            this.element.innerHTML = output
        })
    }

}