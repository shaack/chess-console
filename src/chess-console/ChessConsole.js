/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Module} from "../../src/svjs-app/Module.js"

export class ChessConsole extends Module {

    constructor(element, config) {
        super(element, config)
        this.render()
    }

    render() {
        const colsetConsoleGame = "console-game col-lg-7 order-lg-2 col-md-8 order-md-1 order-sm-1 col-sm-12 order-sm-1"
        const colsetConsoleControls = "console-controls col-lg-3 order-lg-3 col-md-4 order-md-2 col-sm-8 order-sm-3"
        const colsetConsoleStatus = "console-status col-lg-2 order-lg-1 order-md-3 col-sm-4 order-sm-2"
        this.element.innerHTML =
            `<div class="row chess-console">
                <div class="${colsetConsoleGame}">
                    <div class="player top">&nbsp;</div>
                    <div class="chessboard"></div>
                    <div class="player bottom">&nbsp;</div>
                </div>
                <div class="${colsetConsoleControls}">
                    <div class="control-icons">
                        <span class="board-control"></span>
                        <span class="game-control"></span>
                    </div>
                    <div class="game-status"></div>
                    <div class="last-error"></div>
                </div>
                <div class="${colsetConsoleStatus}">
                    <div class="history"></div>
                    <div class="captured-pieces"></div>
                    <div class="engine-status"></div>
                </div>
            </div>`
    }
}