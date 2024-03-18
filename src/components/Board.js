/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Chessboard, COLOR, INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {FEN} from "cm-chessboard/src/model/Position.js"
import {Markers} from "cm-chessboard/src/extensions/markers/Markers.js"
import {Observe} from "cm-web-modules/src/observe/Observe.js"
import {UiComponent} from "cm-web-modules/src/app/Component.js"
import {CoreUtils} from "cm-web-modules/src/utils/CoreUtils.js"
import {DomUtils} from "cm-web-modules/src/utils/DomUtils.js"
import {PromotionDialog} from "cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js"
import {Accessibility} from "cm-chessboard/src/extensions/accessibility/Accessibility.js"
import {CONSOLE_MESSAGE_TOPICS} from "../ChessConsole.js"
import {AutoBorderNone} from "cm-chessboard/src/extensions/auto-border-none/AutoBorderNone.js"

export const CONSOLE_MARKER_TYPE = {
    moveInput: {class: "marker-frame", slice: "markerFrame"},
    check: {class: "marker-circle-danger", slice: "markerCircle"},
    wrongMove: {class: "marker-frame-danger", slice: "markerFrame"},
    premove: {class: "marker-frame-primary", slice: "markerFrame"},
    legalMove: {class: "marker-dot", slice: "markerDot"},
    legalMoveCapture: {class: "marker-bevel", slice: "markerBevel"}
}

export class Board extends UiComponent {

    constructor(chessConsole, props = {}) {
        super(chessConsole.componentContainers.board, props)
        chessConsole.components.board = this // register board component, to allow access to the promotion dialog
        this.initialized = new Promise((resolve) => {
            this.i18n = chessConsole.i18n
            this.i18n.load({
                de: {
                    chessBoard: "Schachbrett"
                },
                en: {
                    chessBoard: "Chess Board"
                }
            }).then(() => {
                this.chessConsole = chessConsole
                this.elements = {
                    playerTop: document.createElement("div"),
                    playerBottom: document.createElement("div"),
                    chessboard: document.createElement("div")
                }
                this.elements.playerTop.setAttribute("class", "player top")
                this.elements.playerTop.innerHTML = "&nbsp;"
                this.elements.playerBottom.setAttribute("class", "player bottom")
                this.elements.playerBottom.innerHTML = "&nbsp;"
                this.elements.chessboard.setAttribute("class", "chessboard")
                this.context.appendChild(DomUtils.createElement("<h2 class='visually-hidden'>" + this.i18n.t("chessBoard") + "</h2>"))
                this.context.appendChild(this.elements.playerTop)
                this.context.appendChild(this.elements.chessboard)
                this.context.appendChild(this.elements.playerBottom)
                this.chessConsole.state.observeChess((params) => {
                    let animated = true
                    if (params.functionName === "load_pgn") {
                        animated = false
                    }
                    this.setPositionOfPlyViewed(animated)
                    this.markLastMove()
                })
                Observe.property(this.chessConsole.state, "plyViewed", (props) => {
                    this.setPositionOfPlyViewed(props.oldValue !== undefined)
                    this.markLastMove()
                })
                this.props = {
                    position: FEN.empty,
                    orientation: chessConsole.state.orientation,
                    assetsUrl: undefined,
                    markLegalMoves: true,
                    style: {
                        aspectRatio: 0.98
                    },
                    accessibility: {
                        active: true, // turn accessibility on or off
                        brailleNotationInAlt: true, // show the braille notation of the position in the alt attribute of the SVG image
                        movePieceForm: true, // display a form to move a piece (from, to, move)
                        boardAsTable: true, // display the board additionally as HTML table
                        piecesAsList: true, // display the pieces additionally as List
                        visuallyHidden: true // hide all those extra outputs visually but keep them accessible for screen readers and braille displays
                    },
                    markers: {
                        moveInput: CONSOLE_MARKER_TYPE.moveInput,
                        check: CONSOLE_MARKER_TYPE.check,
                        wrongMove: CONSOLE_MARKER_TYPE.wrongMove,
                        premove: CONSOLE_MARKER_TYPE.premove,
                        legalMove: CONSOLE_MARKER_TYPE.legalMove,
                        legalMoveCapture: CONSOLE_MARKER_TYPE.legalMoveCapture
                    },
                    extensions: [{class: PromotionDialog}, {
                        class: ChessConsoleMarkers, props: {
                            board: this,
                            autoMarkers: props.markers && props.markers.moveInput ? {...props.markers.moveInput} : {...CONSOLE_MARKER_TYPE.moveInput}
                        }
                    }, {class: AutoBorderNone}]
                }
                CoreUtils.mergeObjects(this.props, props)
                if (this.props.accessibility.active) {
                    this.props.extensions.push({
                        class: Accessibility, props: this.props.accessibility
                    })
                }
                this.chessboard = new Chessboard(this.elements.chessboard, this.props)
                Observe.property(chessConsole.state, "orientation", () => {
                    this.setPlayerNames()
                    this.chessboard.setOrientation(chessConsole.state.orientation).then(() => {
                        this.markPlayerToMove()
                    })
                })
                Observe.property(chessConsole.player, "name", () => {
                    this.setPlayerNames()
                })
                Observe.property(chessConsole.opponent, "name", () => {
                    this.setPlayerNames()
                })
                chessConsole.messageBroker.subscribe(CONSOLE_MESSAGE_TOPICS.moveRequest, () => {
                    this.markPlayerToMove()
                })
                this.chessConsole.messageBroker.subscribe(CONSOLE_MESSAGE_TOPICS.illegalMove, (message) => {
                    this.chessboard.removeMarkers(this.props.markers.wrongMove)
                    clearTimeout(this.removeMarkersTimeout)
                    if (message.move.from) {
                        this.chessboard.addMarker(this.props.markers.wrongMove, message.move.from)
                    } else {
                        console.warn("illegalMove without `message.move.from`")
                    }
                    if (message.move.to) {
                        this.chessboard.addMarker(this.props.markers.wrongMove, message.move.to)
                    }
                    this.removeMarkersTimeout = setTimeout(() => {
                        this.chessboard.removeMarkers(this.props.markers.wrongMove)
                    }, 500)
                })
                this.setPositionOfPlyViewed(false)
                this.setPlayerNames()
                this.markPlayerToMove()
                this.markLastMove()

                resolve(this)
            })
        })
        /**
         * @deprecated 2023-04-11 use `this.initialized` instead
         */
        this.initialization = this.initialized
    }

    setPositionOfPlyViewed(animated = true) {
        clearTimeout(this.setPositionOfPlyViewedDebounced)
        this.setPositionOfPlyViewedDebounced = setTimeout(() => {
            const to = this.chessConsole.state.chess.fenOfPly(this.chessConsole.state.plyViewed)
            this.chessboard.setPosition(to, animated)
        })
    }

    markLastMove() {
        window.clearTimeout(this.markLastMoveDebounce)
        this.markLastMoveDebounce = setTimeout(() => {
            this.chessboard.removeMarkers(this.props.markers.moveInput)
            this.chessboard.removeMarkers(this.props.markers.check)
            if (this.chessConsole.state.plyViewed > 0) {
                const lastMove = this.chessConsole.state.chess.history()[this.chessConsole.state.plyViewed - 1]
                if (lastMove) {
                    this.chessboard.addMarker(this.props.markers.moveInput, lastMove.from)
                    this.chessboard.addMarker(this.props.markers.moveInput, lastMove.to)
                }
                if (this.chessConsole.state.chess.inCheck(lastMove) || this.chessConsole.state.chess.inCheckmate(lastMove)) {
                    const kingSquare = this.chessConsole.state.chess.pieces("k", this.chessConsole.state.chess.turn(), lastMove)[0]
                    this.chessboard.addMarker(this.props.markers.check, kingSquare.square)
                }
            }
        })
    }

    setPlayerNames() {
        window.clearTimeout(this.setPlayerNamesDebounce)
        this.setPlayerNamesDebounce = setTimeout(() => {
            if (this.chessConsole.props.playerColor === this.chessConsole.state.orientation) {
                this.elements.playerBottom.innerHTML = this.chessConsole.player.name
                this.elements.playerTop.innerHTML = this.chessConsole.opponent.name
            } else {
                this.elements.playerBottom.innerHTML = this.chessConsole.opponent.name
                this.elements.playerTop.innerHTML = this.chessConsole.player.name
            }
        })
    }

    markPlayerToMove() {
        clearTimeout(this.markPlayerToMoveDebounce)
        this.markPlayerToMoveDebounce = setTimeout(() => {
            this.elements.playerTop.classList.remove("to-move")
            this.elements.playerBottom.classList.remove("to-move")
            this.elements.playerTop.classList.remove("not-to-move")
            this.elements.playerBottom.classList.remove("not-to-move")
            const playerMove = this.chessConsole.playerToMove()
            if (
                this.chessConsole.state.orientation === COLOR.white &&
                playerMove === this.chessConsole.playerWhite() ||
                this.chessConsole.state.orientation === COLOR.black &&
                playerMove === this.chessConsole.playerBlack()) {
                this.elements.playerBottom.classList.add("to-move")
                this.elements.playerTop.classList.add("not-to-move")
            } else {
                this.elements.playerTop.classList.add("to-move")
                this.elements.playerBottom.classList.add("not-to-move")
            }
        }, 10)
    }

}

class ChessConsoleMarkers extends Markers {
    drawAutoMarkers(event) {
        clearTimeout(this.drawAutoMarkersDebounced)
        this.drawAutoMarkersDebounced = setTimeout(() => {
                this.removeMarkers(this.props.autoMarkers)
                const board = this.props.board
                const moves = this.props.board.chessConsole.state.chess.moves({square: event.square, verbose: true})
                if (board.props.markLegalMoves) {
                    if (event.type === INPUT_EVENT_TYPE.moveInputStarted ||
                        event.type === INPUT_EVENT_TYPE.validateMoveInput ||
                        event.type === INPUT_EVENT_TYPE.moveInputCanceled ||
                        event.type === INPUT_EVENT_TYPE.moveInputFinished) {
                        event.chessboard.removeMarkers(board.props.markers.legalMove)
                        event.chessboard.removeMarkers(board.props.markers.legalMoveCapture)
                    }
                    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
                        for (const move of moves) { // draw dots on possible squares
                            if (move.promotion && move.promotion !== "q") {
                                continue
                            }
                            if (event.chessboard.getPiece(move.to)) {
                                event.chessboard.addMarker(board.props.markers.legalMoveCapture, move.to)
                            } else {
                                event.chessboard.addMarker(board.props.markers.legalMove, move.to)
                            }
                        }
                    }
                }
                if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
                    if (event.moveInputCallbackResult) {
                        this.addMarker(this.props.autoMarkers, event.squareFrom)
                    }
                } else if (event.type === INPUT_EVENT_TYPE.movingOverSquare) {
                    this.addMarker(this.props.autoMarkers, event.squareFrom)
                    if (event.squareTo) {
                        this.addMarker(this.props.autoMarkers, event.squareTo)
                    }
                }
            }
        )
    }
}
