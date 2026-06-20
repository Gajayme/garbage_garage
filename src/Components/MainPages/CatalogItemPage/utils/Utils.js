export const validateItemData = (data) => {
	if (!data || typeof data !== "object") return false;

	if (
		data.itemName === undefined ||
		data.size === undefined ||
		data.price === undefined ||
		data.description === undefined ||
		data.images === undefined
	) {
		return false;
	}
	return true;
}

export const getItemData = (data) => {
	return {
		title: data.brand + " " + (data.model ? data.model : "") + " " + data.type,
		size: data.size,
		price: data.price,
		description: data.description,
		images: data.images,
	};
}
