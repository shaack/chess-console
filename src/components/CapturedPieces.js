/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "cm-web-modules/src/observe/Observe.js"
import {UiComponent} from "cm-web-modules/src/app/Component.js"
import {PIECES} from "cm-chess/src/Chess.js"

const zeroWithSpace = "&#8203;"

export class CapturedPieces extends UiComponent {

    constructor(chessConsole) {
        super(chessConsole)
        this.chessConsole = chessConsole
        this.element = document.createElement("div")
        this.element.setAttribute("class", "captured-pieces")
        this.chessConsole.componentContainers.left.querySelector(".chess-console-captured").appendChild(this.element)
        this.chessConsole.state.observeChess(() => {
            this.redraw()
        })
        Observe.property(this.chessConsole.state, "plyViewed", () => {
            this.redraw()
        })
        Observe.property(this.chessConsole.state, "orientation", () => {
            this.redraw()
        })
        this.i18n = chessConsole.i18n
        this.i18n.load({
            "de": {
                "captured_pieces": "Geschlagene Figuren"
            },
            "en": {
                "captured_pieces": "Captured pieces"
            }
        }).then(() => {
            this.redraw()
        })
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
            history.forEach((move, index) => {
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
            const outputWhite = this.renderPieces(capturedPiecesWhite, capturedPiecesWhiteAfterPlyViewed, pointsWhite)
            const outputBlack = this.renderPieces(capturedPiecesBlack, capturedPiecesBlackAfterPlyViewed, pointsBlack)
            this.element.innerHTML = "<h2 class='visually-hidden'>" + this.i18n.t("captured_pieces") + "</h2>" +
                (this.chessConsole.state.orientation === "w" ? outputWhite + outputBlack : outputBlack + outputWhite)
        })
    }

    renderPieces(capturedPieces, capturedPiecesAfterPlyViewed, points) {
        let output = "<div>"
        if (capturedPieces.length > 0) {
            output += capturedPieces.join(zeroWithSpace)
        }
        if (capturedPiecesAfterPlyViewed.length > 0) {
            output += "<span class='text-muted'>" + capturedPiecesAfterPlyViewed.join(zeroWithSpace) + "</span>"
        }
        output += "<small> " + (points > 0 ? points : "") + "</small></div>"
        return output
    }


}
