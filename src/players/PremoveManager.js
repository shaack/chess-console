/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

/**
 * Manages premove queue and markers for LocalPlayer.
 * Premoves allow players to queue moves while waiting for opponent.
 */
export class PremoveManager {

    constructor(chessConsole) {
        this.chessConsole = chessConsole
        this.queue = []
        this.contextMenuInitialized = false
    }

    /**
     * Initialize context menu handler to clear premoves on right-click.
     * Only initializes once per instance.
     */
    initContextMenu() {
        if (this.contextMenuInitialized) return

        const chessboard = this.chessConsole.components.board.chessboard
        chessboard.context.addEventListener("contextmenu", (event) => {
            event.preventDefault()
            if (this.queue.length > 0) {
                this.clear()
            }
        })
        this.contextMenuInitialized = true
    }

    /**
     * Add a premove event to the queue.
     * @param {Object} event - The move input event from cm-chessboard
     */
    add(event) {
        this.queue.push(event)
        this.updateMarkers()
    }

    /**
     * Get and remove the next premove from the queue.
     * @returns {Object|undefined} The next premove event, or undefined if queue is empty
     */
    shift() {
        const event = this.queue.shift()
        this.updateMarkers()
        return event
    }

    /**
     * Check if there are premoves in the queue.
     * @returns {boolean}
     */
    hasPremoves() {
        return this.queue.length > 0
    }

    /**
     * Clear all premoves and reset board position.
     */
    clear() {
        this.queue = []
        this.updateMarkers()
        this.resetBoardPosition()
    }

    /**
     * Clear premoves without resetting board position.
     */
    clearQueue() {
        this.queue = []
        this.updateMarkers()
    }

    /**
     * Update visual markers on the board for queued premoves.
     */
    updateMarkers() {
        const board = this.chessConsole.components.board
        const chessboard = board.chessboard
        const premoveMarker = board.props.markers.premove

        chessboard.removeMarkers(premoveMarker)
        for (const premove of this.queue) {
            chessboard.addMarker(premoveMarker, premove.squareTo)
        }
    }

    /**
     * Reset board position to current game state.
     */
    resetBoardPosition() {
        const chessboard = this.chessConsole.components.board.chessboard
        const fen = this.chessConsole.state.chess.fen()
        chessboard.setPosition(fen, true)
    }
}
