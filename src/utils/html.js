/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

/**
 * Tagged template literal for HTML strings.
 * Handles arrays (joins them), and provides cleaner template syntax.
 *
 * @example
 * const items = ['a', 'b', 'c']
 * html`<ul>${items.map(item => html`<li>${item}</li>`)}</ul>`
 * // => "<ul><li>a</li><li>b</li><li>c</li></ul>"
 *
 * @param {TemplateStringsArray} strings - Template literal strings
 * @param {...*} values - Interpolated values
 * @returns {string} The resulting HTML string
 */
export function html(strings, ...values) {
    return strings.reduce((result, str, i) => {
        let value = values[i] ?? ''
        if (Array.isArray(value)) {
            value = value.join('')
        }
        return result + str + value
    }, '')
}
