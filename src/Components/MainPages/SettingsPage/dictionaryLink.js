import { compareLabels } from "Components/utils/labelCollator.js";

/**
 * Привязка элементов справочника к элементам другого справочника (размеров —
 * к типам). Объект привязки собирает страница настроек и передаёт секции
 * справочника пропом `link`; всё, что зависит от конкретного связанного
 * справочника, секция и её части берут из этого объекта.
 *
 * @typedef {object} DictionaryLink
 * @property {Array<{id: number, title: string}>} options - Элементы связанного
 *   справочника.
 * @property {string} itemField - Поле элемента, где лежат связанные элементы
 *   в виде [{ id, title }].
 * @property {string} label - Заголовок чекбоксов, во множественном числе
 *   («Types»); из него же собираются подписи «No …» и текст подсказки
 *   о пустой обязательной привязке.
 * @property {boolean} [required] - Без хотя бы одного связанного элемента
 *   элемент не сохранить.
 */

/**
 * id связанных элементов, к которым привязан элемент.
 *
 * @param {object|undefined} item - Элемент справочника:
 *   { id, title, [link.itemField]: [{ id, title }] }. Например, размер из
 *   size/all: { id: 8, title: "M", types: [{ id: 12, title: "hoodie" }, …] }.
 *   undefined — элемента нет (секция ничего не правит или элемент пропал
 *   из списка после перезапроса); нет поля `link.itemField` — связанных нет.
 *   В обоих случаях — пустой массив.
 * @param {DictionaryLink} [link] - Привязка: из `link.itemField` берётся,
 *   в каком поле элемента лежат связанные. Нет привязки (бренды, покупатели
 *   и т.п.) — пустой массив.
 * @returns {number[]} id связанных в том порядке, в каком они лежат
 *   в элементе: [12, 4].
 */
export const linkedIdsOf = (item, link) => {
	if (!link) return [];
	const linkedItems = item?.[link.itemField] ?? [];
	return linkedItems.map((linked) => linked.id);
};

/**
 * Названия связанных элементов через запятую.
 * Названия берутся из `link.options`, а не из самого элемента. После правки
 * связанного справочника перезапрашивается и он, и справочник с привязкой
 * (если секция связанного передаёт его ключ в relatedQueryKeys — у типов так
 * и есть), ответы приходят в разное время, и так подписи меняются вместе
 * с секцией связанного справочника, не дожидаясь ответа справочника с привязкой.
 *
 * @param {object} item - Элемент справочника, у которого выводятся связанные:
 *   { id, title, [link.itemField]: [{ id, title }] }. Например, размер из
 *   size/all: { id: 8, title: "M", types: [{ id: 12, title: "hoodie" }, …] }.
 *   Нет поля `link.itemField` — связанных нет.
 * @param {DictionaryLink} link - Привязка: из `link.itemField` берутся id
 *   связанных, из `link.options` — их названия, из `link.label` — подпись
 *   «No …», когда связанных нет.
 * @returns {string} Названия связанных по алфавиту через запятую
 *   («hoodie, jacket») или «No <label в нижнем регистре>» («No types»).
 */
export const linkedTitles = (item, link) => {
	const linkedItems = item?.[link.itemField] ?? [];
	if (linkedItems.length === 0) return `No ${link.label.toLowerCase()}`;

	const titleById = new Map();
	for (const option of link.options ?? []) {
		titleById.set(option.id, option.title);
	}

	// Связанного элемента нет в `link.options`, если он удалён, а ответ справочника
	// элемента ещё старый, или связанный справочник не загрузился, — тогда
	// берётся название из самого элемента.
	const titleOf = (linked) => titleById.get(linked.id) ?? linked.title;

	const titles = linkedItems.map(titleOf).sort(compareLabels);
	return titles.join(", ");
};

/**
 * Текст подсказки под чекбоксами, когда привязка обязательна, а ничего
 * не отмечено: объясняет, почему кнопка добавления или сохранения заблокирована.
 *
 * @param {DictionaryLink} link - Привязка; из неё нужен только `link.label`
 *   («Types»).
 * @returns {string} «<label>: choose at least one», например
 *   «Types: choose at least one».
 */
export const linkRequiredHint = (link) => `${link.label}: choose at least one`;
