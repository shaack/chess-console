# chess-console

ChessConsole is a JavaScript-based chess game client framework that uses [cm-chessboard](https://github.com/shaack/cm-chessboard) and [Bootstrap](https://getbootstrap.com/) to create a browser-based, mobile-friendly, responsive chess game GUI.

- **[Repository on GitHub](https://github.com/shaack/chess-console)**
- **[Demo pages](https://shaack.com/projekte/chess-console)**

### chess-console is used in Production

**[Used by chessmail as a framework for an online chess computer.](https://www.chessmail.eu/pages/chess-computer.html)**

## Component structure

Because of its component architecture chess-console is expandable for all kind of chess pages. You may check out the [Stockfish Player](https://github.com/shaack/chess-console-stockfish) for chess-console, a fully functional online chess computer.

## Screenshot

![Example chess-console](https://shaack.com/projekte/assets/img/example_chess_console_checkmate.png)

## Installation

### Option 1: Download from GitHub

1. Clone the repository:
    ```sh
    git clone https://github.com/shaack/chess-console.git
    ```
2. Navigate to the project directory and install dependencies:
    ```sh
    cd chess-console
    npm install
    ```

### Option 2: Install via npm

1. Install the npm package:
    ```sh
    npm install chess-console
    ```

## Usage

### Initialization

To initialize a new ChessConsole instance, you need to provide the context, player, opponent, and optional properties.

```javascript
import { ChessConsole } from 'chess-console';

const context = document.getElementById('chess-console');
// a LocalPlayer, that can be controlled by the user
const player = { type: LocalPlayer, name: 'Player 1', props: {} };
// an engine player, that playes random moves
const opponent = { type: RandomPlayer, name: 'Player 2', props: {} };

const chessConsole = new ChessConsole(context, player, opponent, {
    locale: 'en',
    playerColor: 'w',
    pgn: undefined,
    accessible: false
});
```

## Licenses

Source code license: <a href="https://github.com/shaack/chess-console/blob/master/LICENSE">MIT</a>,<br/>
License for the Sounds: <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>,<br/>
License of the SVG pieces <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>.

Copyright &copy; [shaack.com](https://shaack.com).
