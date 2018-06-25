/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {Component} from "../../svjs-app/Component.js"

export class PlayerBars extends Component {

    constructor(module) {
        super(module)
        this.topBarElement = this.module.container.querySelector(".player.top")
        this.bottomBarElement = this.module.container.querySelector(".player.bottom")
    }

}