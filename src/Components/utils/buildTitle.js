/**
 * Строит заголовок для страницы вещи.
 *
 * @param {string} brand
 * @param {string|null} model
 * @param {string} type
 * @returns {string}
 */
export const buildTitle = (brand, model, type) => {
	return brand + " " + (model ? model + " " : "") + type;
}
