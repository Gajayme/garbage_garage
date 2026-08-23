import { NumbersOnly } from "Components/utils/inputFilters.js";
import { itemFieldLabel } from "Components/utils/itemFieldLabels.js";
import * as UploadConstants from "Components/MainPages/UploadPage/UploadPageConstants.js";
import {
	buildDropdownState,
	buildStatusDropdownState,
} from "Components/MainPages/UploadPage/buildDropdownState.js";
import {
	NonEmpty,
	NonEmptyImages,
} from "Components/MainPages/UploadPage/Validations/Validations.js";

import * as Constants from "Constants.js";

/**
 * Конфигурация полей формы загрузки: что за поля, как называются, как
 * проверяются и как уходят на сервер. Компонент отсюда только читает.
 */

const toInt = (value) => parseInt(value, 10);

// Декларативный конфиг дропдаунов. Статическая часть (имя поля формы, лейбл,
// id, плейсхолдер, билдер опций, ключ источника данных в useInputParams)
// Опции (`options`) добавляет компонент через useMemo поверх этого конфига,
// потому что зависят от ответа useInputParams.
export const DROPDOWN_DEFS = [
	{ name: Constants.brand,    label: itemFieldLabel(Constants.brand),    id: "brand_dropdown",
		apiField: Constants.brandId,    serialize: toInt, empty: null,
		dataKey: "brands",    placeholder: UploadConstants.chooseBrand,    builder: buildDropdownState },
	{ name: Constants.type,     label: itemFieldLabel(Constants.type),     id: "type_dropdown",
		apiField: Constants.typeId,     serialize: toInt, empty: null,
		dataKey: "types",     placeholder: UploadConstants.chooseType,     builder: buildDropdownState },
	{ name: Constants.buyer,    label: itemFieldLabel(Constants.buyer),    id: "buyer_dropdown",
		apiField: Constants.buyerId,    serialize: toInt, empty: null,
		dataKey: "buyers",    placeholder: UploadConstants.chooseBuyer,    builder: buildDropdownState },
	{ name: Constants.location, label: itemFieldLabel(Constants.location), id: "location_dropdown",
		apiField: Constants.locationId, serialize: toInt, empty: null,
		dataKey: "locations", placeholder: UploadConstants.chooseLocation, builder: buildDropdownState },
	{ name: Constants.status, label: itemFieldLabel(Constants.status), id: "status_dropdown",
		apiField: Constants.status,     serialize: (value) => value ?? "", empty: null,
		dataKey: "statuses",  placeholder: UploadConstants.chooseStatus,   builder: buildStatusDropdownState },
];

// Описание полей-инпутов (рендер идёт через .map)
export const INPUT_DEFS = [
	{ name: Constants.itemName,   label: itemFieldLabel(Constants.itemName),   id: "item_name_input",  maxLength: 50 },
	{ name: Constants.model,      label: itemFieldLabel(Constants.model),      id: "item_model_input", maxLength: 50 },
	{ name: Constants.buyersPart, label: itemFieldLabel(Constants.buyersPart), id: "buyer_part_input", maxLength: 10, inputValidator: NumbersOnly, serialize: toInt },
	{ name: Constants.boughtFor,  label: itemFieldLabel(Constants.boughtFor),  id: "bought_for_input", maxLength: 10, inputValidator: NumbersOnly, serialize: toInt },
	{ name: Constants.price,      label: itemFieldLabel(Constants.price),      id: "price_input",      maxLength: 10, inputValidator: NumbersOnly, serialize: toInt },
	{ name: Constants.soldFor,    label: itemFieldLabel(Constants.soldFor),    id: "sold_for_input",   maxLength: 10, inputValidator: NumbersOnly, serialize: toInt },
	{ name: Constants.size,       label: itemFieldLabel(Constants.size),       id: "size_input",       maxLength: 10 },
];

// Многострочные поля (textarea)
export const TEXT_AREA_DEFS = [
	{
		name: Constants.description,
		label: itemFieldLabel(Constants.description),
		id: "description_textarea",
		maxLength: 2000,
		rows: 5,
	},
];

/**
 * Описание одного поля формы. Три списка выше однородны по типу контрола,
 * но ключи у их записей общие — вот они целиком.
 *
 * @typedef {object} FieldDef
 * @property {string} name - Ключ в formState/errorState и имя поля в API.
 *   Обязателен; по нему же берётся подпись из itemFieldLabels.
 * @property {string} label - Готовая подпись (её собирают через itemFieldLabel).
 * @property {string} id - id контрола, он же htmlFor у подписи.
 * @property {string} [apiField] - Имя поля на запись, если оно отличается от
 *   name. Только у справочников: brand в состоянии → brandId на сервер.
 * @property {(value: any) => any} [serialize] - Преобразование значения перед
 *   отправкой. Нет — значение уходит как есть.
 * @property {any} [empty] - Пустое значение поля. Нет — пустая строка.
 * @property {number} [maxLength] - Инпуты и textarea.
 * @property {(value: string) => boolean} [inputValidator] - Фильтр ввода.
 * @property {number} [rows] - Только textarea.
 * @property {string} [dataKey] - Дропдауны: ключ справочника в useInputParams.
 * @property {string} [placeholder] - Дропдауны: подпись пустого варианта.
 * @property {Function} [builder] - Дропдауны: сборка options из справочника.
 */

/**
 * Все поля формы, кроме картинок: у тех своя ветка и в стейте, и в FormData.
 * Единственное перечисление полей — и стейт, и отправка идут отсюда, поэтому
 * новый список контролов достаточно добавить сюда.
 * @type {FieldDef[]}
 */
export const FIELD_DEFS = [...INPUT_DEFS, ...DROPDOWN_DEFS, ...TEXT_AREA_DEFS];

// Стабильные пустые значения формы и ошибок — module scope, чтобы ссылки не
// пересоздавались на каждом рендере и их можно было передавать в кастомные
// хуки без триггера их useEffect.
export const INITIAL_FORM = {
	...Object.fromEntries(FIELD_DEFS.map(({ name, empty = '' }) => [name, empty])),
	images: [],
};

export const INITIAL_ERRORS = Object.fromEntries(
	Object.keys(INITIAL_FORM).map((k) => [k, []])
);

// Маппер «поле → массив валидаторов».
export const VALIDATION_MAPPER = {
	[Constants.itemName]: [NonEmpty],
	[Constants.boughtFor]: [NonEmpty],
	[Constants.price]: [NonEmpty],
	[Constants.buyersPart]: [],
	[Constants.soldFor]: [],
	[Constants.size]: [],
	[Constants.buyer]: [NonEmpty],
	[Constants.location]: [NonEmpty],
	[Constants.brand]: [NonEmpty],
	[Constants.type]: [NonEmpty],
	[Constants.status]: [NonEmpty],
	[Constants.description]: [NonEmpty],
	images: [NonEmptyImages],
};

/**
 * Проверка дефов на старте, только в dev. Ловит то, что иначе не проявится ни
 * при сборке, ни в браузере, а уедет неправильными данными на сервер: опечатка
 * в имени константы даёт apiField === undefined, и `apiField ?? name` молча
 * отправит поле под именем на чтение (brand вместо brandId).
 */
const assertFieldDefs = () => {
	const seen = new Set();
	FIELD_DEFS.forEach((def, index) => {
		const where = `FIELD_DEFS[${index}] (${def.name ?? "без name"})`;
		if (typeof def.name !== "string" || def.name === "") {
			throw new Error(`${where}: name обязателен и должен быть непустой строкой`);
		}
		if (seen.has(def.name)) {
			throw new Error(`${where}: имя поля повторяется, дефы перетрут друг друга`);
		}
		seen.add(def.name);
		if ("apiField" in def && typeof def.apiField !== "string") {
			throw new Error(`${where}: apiField объявлен, но это не строка — опечатка в имени константы?`);
		}
		if ("serialize" in def && typeof def.serialize !== "function") {
			throw new Error(`${where}: serialize объявлен, но это не функция`);
		}
		if (!(def.name in INITIAL_FORM)) {
			throw new Error(`${where}: поля нет в INITIAL_FORM`);
		}
	});
};

if (process.env.NODE_ENV !== "production") {
	assertFieldDefs();
}
