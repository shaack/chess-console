/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {COLOR} from "cm-chess/src/Chess.js"
import "bootstrap-show-modal/src/ShowModal.js"

export class NewGameDialog {

    constructor(module, props) {
        const i18n = module.i18n
        i18n.load({
            de: {
                color: "Farbe",
                white: "Weiss",
                black: "Schwarz",
                auto: "automatisch"
            },
            en: {
                color: "Color",
                white: "White",
                black: "Black",
                auto: "automatically"
            }
        }).then(() => {
            const newGameColor = module.persistence.loadValue("newGameColor")
            props.modalClass = "fade"
            props.body =
               `<form class="form"><div class="form-group row">
                    <div class="col-3"><label for="color" class="col-form-label">${i18n.t("color")}</label></div>
                    <div class="col-9"><select id="color" class="form-select">
                        <option value="auto">${i18n.t("auto")}</option>
                        <option value="w" ${newGameColor === "w" ? "selected" : ""}>${i18n.t("white")}</option>
                        <option value="b" ${newGameColor === "b" ? "selected" : ""}>${i18n.t("black")}</option>
                    </select></div>
                </div></form>`
            props.footer = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${i18n.t("cancel")}</button>
            <button type="submit" class="btn btn-primary">${i18n.t("ok")}</button>`
            props.onCreate = (modal) => {
                modal.element.querySelector("button[type='submit']").addEventListener("click", function (event) {
                    event.preventDefault()
                    const formElement = modal.element.querySelector(".form")
                    let color = formElement.querySelector("#color").value
                    module.persistence.saveValue("newGameColor", color)
                    if (color !== COLOR.white && color !== COLOR.black) {
                        color = (module.props.playerColor === COLOR.white) ? COLOR.black : COLOR.white
                    }
                    modal.hide()
                    module.newGame({playerColor: color})
                })
            }
            bootstrap.showModal(props)
        })
    }

}
