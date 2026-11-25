import * as UploadConstants from "Components/MainPages/UploadPage/UploadPageConstants.js";
import { compareLabels } from "Components/utils/labelCollator.js";
import { sizesForType } from "Components/utils/sizes.js";

/**
 * Опции дропдауна — массив пар [подпись, значение], первой идёт пустой вариант.
 *
 * Массив, а не объект { подпись: значение }: ключи-целые числа ("30", "42")
 * объект перечисляет раньше остальных и по возрастанию, независимо от порядка
 * добавления, — числовые размеры встали бы перед пустым вариантом и буквенными.
 */

/** Бренды, типы, покупатели, местоположения с API: массив объектов; в селекте title (или name), в value id. */
export const buildDropdownState = (items, chooseLabel, defaultId) => {
	const options = [[chooseLabel, defaultId]];
	if (items && Array.isArray(items)) {
		const sorted = [...items].sort((a, b) =>
			compareLabels(a?.title ?? a?.name, b?.title ?? b?.name)
		);
		for (const item of sorted) {
			const label = item.title ?? item.name;
			if (label != null) options.push([label, item.id]);
		}
	}
	return options;
};

/**
 * Размеры, подходящие выбранному типу: в селекте title, в value id, порядок —
 * compareSizes. Когда выбирать не из чего, подпись пустого варианта объясняет
 * почему: тип ещё не выбран или к нему не привязан ни один размер.
 */
export const buildSizeDropdownState = (sizes, chooseLabel, defaultId, typeId) => {
	if (typeId == null) return [[UploadConstants.chooseTypeFirst, defaultId]];
	const matching = sizesForType(sizes, typeId);
	if (matching.length === 0) return [[UploadConstants.noSizesForType, defaultId]];
	return [
		[chooseLabel, defaultId],
		...matching.map((size) => [size.title, size.id]),
	];
};

/** Статусы с API: массив строк; в селекте и в value одна и та же строка. */
export const buildStatusDropdownState = (statusStrings, chooseLabel, placeholderValue) => [
	[chooseLabel, placeholderValue],
	...(Array.isArray(statusStrings)
		? [...statusStrings]
				.filter((s) => typeof s === "string" && s.length > 0)
				.sort(compareLabels)
				.map((s) => [s, s])
		: []),
];
