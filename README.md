# chess-console

chess-console is a **chess game client framework**, which uses [cm-chessboard](https://github.com/shaack/cm-chessboard) 
and [Bootstrap 4](https://getbootstrap.com/) to create a browser based, mobile friendly, responsive 
chess game gui.

- **[Repository on GitHub](https://github.com/shaack/chess-console)**
- **[Demo pages](https://shaack.com/projekte/chess-console)**

Because if its component architecture chess-console is expandable for
all kind of chess pages. You may check out the [Stockfish Player](https://github.com/shaack/chess-console-stockfish) 
for chess-console, with whom chess-console is a fully functional online
chess computer.

- **[chess-console is used in the chess server "chessmail"](https://www.chessmail.eu/pages/chess-computer.html)**

## Screenshot

![Example chess-console](https://shaack.com/projekte/assets/img/example_chess_console_checkmate.png)

## Installation

- **Option 1:** Download from [GitHub](https://github.com/shaack/chess-console) and run `npm install` without parameters, or
- **Option 2:** Install the [npm package](https://www.npmjs.com/package/chess-console) with `npm install --save chess-console`

## Documentation

### Constructor
`ChessConsole(container, player, opponent, props)`
- container: DOM parent element
- player: {name: playerName, type: Class of player, props: {}}
- opponent: {name: opponentName, type: Class of opponent, props: {}}
- props: Properties

#### props
```
{
    soundSpriteFile: "/assets/sounds/chess_console_sounds.mp3",
    chessboardSpriteFile: "/assets/images/chessboard-sprite.svg",
    playerColor: "w"|"b",
    history: [PGN notation], // initial history
}
```
### state
`chessConsole.state`
```
{
    this.chess = new Chess()
    this.playerColor = props.playerColor || COLOR.white
    this.orientation = props.playerColor || COLOR.white
    this.plyViewed = 0
    this.plyCount = 0
}
```
### Methods

#### playerWhite()
returns the white player

#### playerBlack()
return the black player

#### playerToMove()
return the player who can make a move, null if game_over

#### loalPgn(pgn)
Loads the history part of a PGN, the metadata is ignored

#### nextMove() 
Request the nextMove from `playerToMove()`

#### undoMove()
Take back the last move 

#### initGame(props)
Set a position and player color

#### newGame(props)
Like `initGame(props)`, but sents `newGame` event via messageBroker.

### Messaging

`chessConsole.messageBroker`

Messages:

``` javascript
export const MESSAGE = {
    newGame: function newGame(props) { // A new game was started
        this.props = props
    },
    initGame: function initGame(props) { // The game was initialized
        this.props = props
    },
    gameOver: function gameOver(wonColor) { // w, b, null for draw
        this.wonColor = wonColor
    },
    moveRequest: function moveRequest(player) {
        this.player = player
    },
    legalMove: function legalMove(player, move, moveResult) {
        this.player = player
        this.move = move
        this.moveResult = moveResult
    },
    illegalMove: function illegalMove(player, move) {
        this.player = player
        this.move = move
    },
    moveUndone: function moveUndone() {
    },
    load: function load() {
    }
}
```

## Licenses

Source code license: <a href="https://github.com/shaack/chess-console/blob/master/LICENSE">MIT</a>,<br/>
License for the Sounds: <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>,<br/>
License of the SVG pieces <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.

Copyright &copy; [shaack.com](https://shaack.com) engineering.
