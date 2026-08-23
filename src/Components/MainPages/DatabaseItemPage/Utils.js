import * as Constants from "Constants.js";
import { itemFieldLabel } from "Components/utils/itemFieldLabels.js";

// Поля, которые не идут в список описания: картинки рисует ItemImageGrid,
// id служебный, itemName уходит в заголовок.
const hiddenFields = new Set(["images", "id", Constants.itemName]);

// Порядок вывода — забота этой страницы, поэтому список локальный (подписи
// общие и живут в itemFieldLabels). Поля, которых здесь нет, не теряются:
// они уходят в конец списка — так новое поле с бэкенда сразу видно в админке.
const fieldOrder = [
	Constants.brand,
	Constants.model,
	Constants.type,
	Constants.size,
	Constants.status,
	Constants.price,
	Constants.boughtFor,
	Constants.soldFor,
	Constants.buyersPart,
	Constants.buyer,
	Constants.location,
	Constants.description,
];

const emptyValue = "—";

/**
 * Значение поля вещи → строка для вывода.
 * Справочники (brand, type, buyer, location) приходят объектами: в них
 * показываем title (или name, как в buildDropdownState).
 */
const formatValue = (value) => {
	if (value == null || value === "") return emptyValue;

	if (Array.isArray(value)) {
		const parts = value.map(formatValue).filter((v) => v !== emptyValue);
		return parts.length > 0 ? parts.join(", ") : emptyValue;
	}

	if (typeof value === "object") {
		const label = value.title ?? value.name;
		if (label != null && label !== "") return String(label);
		// незнакомая вложенная структура: лучше показать её как есть,
		// чем спрятать под прочерком
		return JSON.stringify(value);
	}

	if (typeof value === "boolean") return value ? "Yes" : "No";

	return String(value);
};

/** Известные поля в заданном порядке, потом всё остальное — как пришло с API. */
const orderFields = (keys) => {
	const known = fieldOrder.filter((key) => keys.includes(key));
	const unknown = keys.filter((key) => !fieldOrder.includes(key));
	return [...known, ...unknown];
};

/**
 * Данные вещи из ответа detail → то, что рисует ItemDescription.
 *
 * Неполный ответ не отбрасывается: показываем те поля, что пришли. Скрывать
 * карточку целиком из-за одного отсутствующего поля незачем — страница базы
 * для того и нужна, чтобы видеть, что лежит в базе на самом деле.
 *
 * @param {object|null} data - Объект вещи (`data.data` из ответа detail).
 * @returns {{title: string|undefined, restData: Array<{key: string, label: string, value: string}>}|null}
 */
export const buildItemData = (data) => {
	if (!data || typeof data !== "object") return null;

	const keys = orderFields(
		Object.keys(data).filter((key) => !hiddenFields.has(key))
	);

	return {
		title: data.itemName,
		restData: keys.map((key) => ({
			key,
			label: itemFieldLabel(key),
			value: formatValue(data[key]),
		})),
	};
};
