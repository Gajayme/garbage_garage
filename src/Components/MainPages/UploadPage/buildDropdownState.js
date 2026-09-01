import { compareLabels } from "Components/utils/labelCollator.js";

/** Бренды, типы, покупатели, местоположения с API: массив объектов; в селекте title (или name), в value id. */
export const buildDropdownState = (items, chooseLabel, defaultId) => {
	const options = {};
	if (items && Array.isArray(items)) {
		const sorted = [...items].sort((a, b) =>
			compareLabels(a?.title ?? a?.name, b?.title ?? b?.name)
		);
		for (const item of sorted) {
			const label = item.title ?? item.name;
			if (label != null) options[label] = item.id;
		}
	}
	return {
		[chooseLabel]: defaultId,
		...options,
	};
};

/** Статусы с API: массив строк; в селекте и в value одна и та же строка. */
export const buildStatusDropdownState = (statusStrings, chooseLabel, placeholderValue) => ({
	[chooseLabel]: placeholderValue,
	...(Array.isArray(statusStrings)
		? [...statusStrings]
				.sort(compareLabels)
				.reduce((acc, s) => {
					if (typeof s === "string" && s.length > 0) acc[s] = s;
					return acc;
				}, {})
		: {}),
});
