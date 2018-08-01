/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {BootstrapModal} from "../../../../lib/cm-bootstrap-modal/BootstrapModal.js"
import {COLOR} from "../../../../lib/cm-chessboard/Chessboard.js"

export class PromotionDialog extends BootstrapModal {

    show(color, callback) {
        this.piece = null
        this.callback = callback
        let pieceQ = color === COLOR.white ? "wq" : "bq"
        let pieceR = color === COLOR.white ? "wr" : "br"
        let pieceN = color === COLOR.white ? "wn" : "bn"
        let pieceB = color === COLOR.white ? "wb" : "bb"
        const title = "Promotion"
        const body = `<div class="container-fluid">
                        <div class="row">
                            <div class="col text-center">
                                <svg class="piece" data-piece="q">
                                    <use data-piece="q" xlink:href="#${pieceQ}"></use>
                                </svg>
                            </div>
                            <div class="col text-center">
                                <svg class="piece" data-piece="r">
                                    <use data-piece="r" xlink:href="#${pieceR}"></use>
                                </svg>
                            </div>
                            <div class="col text-center">
                                <svg class="piece" data-piece="n">
                                    <use data-piece="n" xlink:href="#${pieceN}"></use>
                                </svg>
                            </div>
                            <div class="col text-center">
                                <svg class="piece" data-piece="b">
                                    <use data-piece="b" xlink:href="#${pieceB}"></use>
                                </svg>
                            </div>
                        </div>
                     </div>`
        return super.show(title, body)
    }

    postCreate() {
        $(this.element).on("click", ".piece", (event) => {
            this.piece = event.target.getAttribute("data-piece")
            this.hide()
        })
        $(this.element).on("hidden.bs.modal", (event) => {
            this.callback(this.piece)
        })
    }

}