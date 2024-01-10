/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Observe} from "cm-web-modules/src/observe/Observe.js"
import {UiComponent} from "cm-web-modules/src/app/Component.js"
import {PIECES} from "cm-chess/src/Chess.js"
import {DomUtils} from "cm-web-modules/src/utils/DomUtils.js"

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
        DomUtils.delegate(this.element, "click", ".piece", (event) => {
            const ply = event.target.getAttribute("data-ply")
            this.chessConsole.state.plyViewed = parseInt(ply, 10)
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
                        const pieceHtml = `<span class="piece" role='button' data-ply='${move.ply}'>` + this.chessConsole.props.figures[pieceCaptured + "w"] + "</span>"
                        if (index < this.chessConsole.state.plyViewed) {
                            capturedPiecesWhite.push(pieceHtml)
                        } else {
                            capturedPiecesWhiteAfterPlyViewed.push(pieceHtml)
                        }
                        pointsWhite += PIECES[pieceCaptured.toLowerCase()].value
                    } else if (move.color === "w") {
                        const pieceHtml = `<span class="piece" role='button' data-ply='${move.ply}'>`  + this.chessConsole.props.figures[pieceCaptured + "b"] + "</span>"
                        if (index < this.chessConsole.state.plyViewed) {
                            capturedPiecesBlack.push(pieceHtml)
                        } else {
                            capturedPiecesBlackAfterPlyViewed.push(pieceHtml)
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
