import * as Constants from "Constants.js";

// Подписи полей вещи — общие для формы загрузки и страницы базы, чтобы одно и
// то же поле не называлось на двух экранах по-разному.
//
// Ключ — имя поля так, как его отдаёт detail. У справочников подпись одна на
// оба направления: и на brand из detail, и на brandId, который уходит на запись.
const labels = {
	[Constants.itemName]: "Item Name",
	[Constants.model]: "Model",
	[Constants.brand]: "Brand",
	[Constants.type]: "Type",
	[Constants.size]: "Size",
	[Constants.status]: "Status",
	[Constants.price]: "Price",
	[Constants.boughtFor]: "Bought for",
	[Constants.soldFor]: "Sold for",
	[Constants.buyersPart]: "Buyer's part",
	[Constants.buyer]: "Buyer",
	[Constants.location]: "Location",
	[Constants.description]: "Description",
};

/**
 * Подпись поля вещи. Для незнакомого поля возвращает само имя: страница базы
 * показывает всё, что пришло с бэкенда, и новое поле должно быть видно хотя бы
 * под техническим именем, а не пропасть и не остаться без подписи.
 *
 * @param {string} field - Имя поля, как в ответе detail.
 * @returns {string}
 */
export const itemFieldLabel = (field) =>
	Object.prototype.hasOwnProperty.call(labels, field) ? labels[field] : field;
