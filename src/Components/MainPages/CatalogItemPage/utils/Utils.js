import { buildTitle } from "Components/utils/buildTitle.js";

export const validateItemData = (data) => {
	if (!data || typeof data !== "object") return false;

	// size не проверяется: он у вещи необязателен.
	if (
		data.itemName === undefined ||
		data.price === undefined ||
		data.images === undefined
	) {
		return false;
	}
	return true;
}

export const getItemData = (data) => {
	return {
		title: buildTitle(data.brand.title, data.model, data.type.title),
		size: data.size?.title ?? null,
		price: data.price,
		description: data.description,
		images: data.images,
	};
}
