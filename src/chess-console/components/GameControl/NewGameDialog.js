/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import "../../../../node_modules/bootstrap-show-modal/src/bootstrap-show-modal.js"

export class NewGameDialog {

    static show() {
        return new Promise((resolve) => {
            const dialog = $.showModal({
                modalClass: "fade",

            })
        })
    }

}