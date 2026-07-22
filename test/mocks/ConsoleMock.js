/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 *
 * Lightweight mocks so player/manager logic can be unit tested without a DOM,
 * a rendered chessboard, or the full ChessConsole wiring.
 */

// A cm-chessboard stand-in that records the calls made against it.
export function mockChessboard(pieces = {}) {
    const calls = {removeMarkers: [], addMarker: [], setPosition: [], disableMoveInput: 0}
    return {
        calls,
        getPiece: (square) => pieces[square] || null,
        removeMarkers: (type) => calls.removeMarkers.push(type),
        addMarker: (type, square) => calls.addMarker.push({type, square}),
        setPosition: (fen, animated) => calls.setPosition.push({fen, animated}),
        disableMoveInput: () => { calls.disableMoveInput++ },
        isMoveInputEnabled: () => false,
        enableMoveInput: () => {},
        context: {addEventListener: () => {}}
    }
}

// A ChessConsole stand-in. `chess` should be an object exposing at least
// fen()/turn(); pass a real cm-chess/chess.mjs instance or a small fake.
export function mockConsole({chess, chessboard, playerToMove} = {}) {
    const published = []
    const board = chessboard || mockChessboard()
    return {
        published,
        state: {
            chess: chess || {fen: () => "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", turn: () => "w", props: {gameVariant: "standard"}},
            plyViewed: 0
        },
        components: {
            board: {
                props: {markers: {premove: "premoveMarker"}},
                chessboard: board
            }
        },
        messageBroker: {publish: (topic, data) => published.push({topic, data})},
        playerToMove: playerToMove || (() => null)
    }
}
