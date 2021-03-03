/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import "../../../../lib/bootstrap-show-modal.js"
import {COLOR} from "../../../../lib/cm-chessboard/Chessboard.js"

export class PromotionDialog {

    constructor(props, callback) {
        this.piece = null
        this.callback = callback
        let pieceQ = props.color === COLOR.white ? "wq" : "bq"
        let pieceR = props.color === COLOR.white ? "wr" : "br"
        let pieceN = props.color === COLOR.white ? "wn" : "bn"
        let pieceB = props.color === COLOR.white ? "wb" : "bb"
        const title = "Promotion"
        const body = `<div class="container-fluid">
                        <div class="row">
                            <div class="col text-center">
                                <svg class="piece" data-piece="q">
                                    <use data-piece="q" xlink:href="${props.spriteUrl}#${pieceQ}"></use>
                                </svg>
                            </div>
                            <div class="col text-center">
                                <svg class="piece" data-piece="r">
                                    <use data-piece="r" xlink:href="${props.spriteUrl}#${pieceR}"></use>
                                </svg>
                            </div>
                            <div class="col text-center">
                                <svg class="piece" data-piece="n"> 
                                    <use data-piece="n" xlink:href="${props.spriteUrl}#${pieceN}"></use>
                                </svg>
                            </div>
                            <div class="col text-center">
                                <svg class="piece" data-piece="b">
                                    <use data-piece="b" xlink:href="${props.spriteUrl}#${pieceB}"></use>
                                </svg>
                            </div>
                        </div>
                     </div>`
        $.showModal({
            modalClass: "fade",
            title: title,
            body: body,
            onCreate: (modal) => {
                $(modal.element).on("click", ".piece", (event) => {
                    modal.piece = event.target.getAttribute("data-piece")
                    modal.hide()
                })
                $(modal.element).on("hidden.bs.modal", (ignored) => {
                    this.callback(modal.piece)
                })
            }
        })
    }

}