/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

/**
 * Manages the premove of a LocalPlayer, Lichess style.
 * There is at most one premove. The board keeps showing the real position, the
 * premove is only marked on its start and target square. A new premove replaces
 * the old one, a click on a square without an own piece or a right click cancels it.
 */
export class PremoveManager {

    constructor(chessConsole) {
        this.chessConsole = chessConsole
        this.premove = null
        this.listenersInitialized = false
    }

    /**
     * Initialize the listeners that cancel the premove.
     * Only initializes once per instance.
     */
    initListeners() {
        if (this.listenersInitialized) return

        const chessboard = this.chessConsole.components.board.chessboard
        chessboard.context.addEventListener("contextmenu", (event) => {
            event.preventDefault()
            this.clear()
        })
        // capture phase, so this runs before cm-chessboard handles the pointerdown
        const pointerDownListener = (event) => {
            if (!this.premove || event.type === "mousedown" && event.button !== 0) return
            const square = event.target.getAttribute && event.target.getAttribute("data-square")
            if (!square || chessboard.view.visualMoveInput.moveInputState !== "waitForInputStart") {
                // not on the board, or the click completes a move input, which sets a new premove
                return
            }
            const piece = chessboard.getPiece(square)
            if (!piece || piece.charAt(0) !== this.premove.color) {
                this.clear()
            }
        }
        chessboard.context.addEventListener("mousedown", pointerDownListener, true)
        chessboard.context.addEventListener("touchstart", pointerDownListener, true)
        this.listenersInitialized = true
    }

    /**
     * Set the premove, replacing an existing one.
     * @param {Object} event - The validateMoveInput event from cm-chessboard
     */
    set(event) {
        const piece = event.chessboard ? event.chessboard.getPiece(event.squareFrom) : null
        this.premove = {
            squareFrom: event.squareFrom,
            squareTo: event.squareTo,
            color: piece ? piece.charAt(0) : null
        }
        this.updateMarkers()
    }

    /**
     * Get and remove the premove, without removing its markers.
     * @returns {Object|null} The premove {squareFrom, squareTo, color}, or null
     */
    take() {
        const premove = this.premove
        // keeps the markers, so they don't flicker until the executed move is marked (updateMarkers)
        this.premove = null
        return premove
    }

    /**
     * @returns {boolean} True, if a premove is set
     */
    hasPremove() {
        return this.premove !== null
    }

    /**
     * Remove the premove. The board position needs no reset, because a premove
     * never moves a piece on the board.
     */
    clear() {
        this.premove = null
        this.updateMarkers()
    }

    /**
     * @deprecated since 7.1.0, use clear()
     */
    clearQueue() {
        this.clear()
    }

    /**
     * Mark start and target square of the premove.
     */
    updateMarkers() {
        const board = this.chessConsole.components.board
        const chessboard = board.chessboard
        const premoveMarker = board.props.markers.premove

        chessboard.removeMarkers(premoveMarker)
        if (this.premove) {
            chessboard.addMarker(premoveMarker, this.premove.squareFrom)
            chessboard.addMarker(premoveMarker, this.premove.squareTo)
        }
    }
}
