/**
 * Проверяет, является ли item валидным.
 *
 * @param {Object} value - Item.
 * @returns {boolean} - true, если item валидный, false в противном случае.
 */
export const validateItem = (value) => {

	const atLeastOneImage = Array.isArray(value.images) && value.images.length > 0;

	if (!atLeastOneImage) {
		console.log("no image for item:", value.id, value.itemName);
		return false;
	}

	const hasPrice = value.price > 0;
	if (!hasPrice) {
		console.log("no price for item:", value.id, value.itemName);
		return false;
	}

	const hasItemName = typeof value.itemName === "string" && value.itemName.length > 0;
	if (!hasItemName) {
		console.log("no item name for item:", value.id, value.itemName);
		return false;
	}

	return true;
};
