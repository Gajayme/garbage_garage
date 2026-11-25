import { compareLabels } from "Components/utils/labelCollator.js";

/**
 * Порядок размеров — как на бирках, а не по алфавиту: по алфавиту L встаёт
 * перед M и S, а XS — после XL.
 *
 * Сначала буквенные размеры от меньшего к большему, затем числовые
 * по значению, затем всё остальное (one size и т.п.) по compareLabels.
 * Равные по рангу (XXL и 2XL) тоже упорядочивает compareLabels.
 */

// Буквенный размер: S или L, перед ними сколько-то X или число с X (2XL = XXL).
const LETTER_SIZE = /^(?:(\d+)X|(X*))([SL])$/;
const NUMERIC_SIZE = /^\d+(?:[.,]\d+)?$/;

// Ранг буквенного размера относительно M: S = -1, XS = -2, L = 1, XL = 2 и т.д.
// null — размер не буквенный.
const letterRank = (title) => {
	if (title === "M") return 0;
	const match = LETTER_SIZE.exec(title);
	if (!match) return null;
	const [, multiplier, xs, letter] = match;
	const steps = (multiplier ? parseInt(multiplier, 10) : xs.length) + 1;
	return letter === "S" ? -steps : steps;
};

const LETTER_GROUP = 0;
const NUMERIC_GROUP = 1;
const OTHER_GROUP = 2;

const sizeSortKey = (title) => {
	const normalized = String(title ?? "").trim().toUpperCase();
	const rank = letterRank(normalized);
	if (rank !== null) return { group: LETTER_GROUP, rank };
	if (NUMERIC_SIZE.test(normalized)) {
		return { group: NUMERIC_GROUP, rank: parseFloat(normalized.replace(",", ".")) };
	}
	return { group: OTHER_GROUP, rank: 0 };
};

/** Сравнение названий размеров. Пригодно как компаратор для Array.prototype.sort. */
export const compareSizes = (a, b) => {
	const keyA = sizeSortKey(a);
	const keyB = sizeSortKey(b);
	return keyA.group - keyB.group || keyA.rank - keyB.rank || compareLabels(a, b);
};

/** Сравнение элементов справочника размеров ({ title }) по названию, как compareSizes. */
export const compareSizeItems = (a, b) => compareSizes(a?.title, b?.title);

/**
 * Размеры, которые подходят типу вещи, в порядке compareSizes.
 *
 * @param {Array<{id: number, title: string, types: Array<{id: number}>}>} sizes - Справочник size/all.
 * @param {number|null} typeId - id типа; пустой — подходящих размеров нет.
 * @returns {Array<{id: number, title: string, types: Array<{id: number}>}>}
 */
export const sizesForType = (sizes, typeId) => {
	if (!Array.isArray(sizes) || typeId == null) return [];
	return sizes
		.filter((size) => size.types?.some((type) => type.id === typeId))
		.sort(compareSizeItems);
};
