/**
 * Порядок размеров — как на бирках, а не по алфавиту: по алфавиту L встаёт
 * перед M и S, а XS — после XL.
 *
 * Размеры делятся на группы по формату записи. Группы не перемешиваются
 * и идут в таком порядке:
 *   1. буквенные, от меньшего к большему: XS S M L XL 2XL 3XL;
 *   2. два буквенных через слеш, по первому, затем по второму: XS/S S/M L/XL;
 *   3. числа, по значению: 30 31 42,5;
 *   4. два числа через слеш — W/L (обхват/длина), по обхвату, затем по длине:
 *      30/32 31/31 32/30;
 *   5. всё остальное, по тексту, но числа в нём по значению: EU 9 EU 10;
 *   6. one size.
 * Регистр и лишние пробелы — по краям, повторяющиеся, вокруг слеша — на группу
 * не влияют: « xl », «32 / 30» и «One Size» узнаются. Пробел внутри размера
 * значим: «2 XL» попадает во всё остальное. Убирать все пробелы нельзя: «7 1/4»
 * превратился бы в W/L «71/4».
 * Внутри группы одинаковые по рангу (XXL и 2XL) упорядочивает sizeCollator.
 *
 * Слеш бывает не только в W/L: S/M, O/S (one size), 7 1/4 (размер кепки),
 * поэтому в группу W/L попадает только запись «число/число».
 */

// Группы в порядке вывода.
const LETTER_GROUP = 0;
const LETTER_PAIR_GROUP = 1;
const NUMERIC_GROUP = 2;
const NUMERIC_PAIR_GROUP = 3;
const OTHER_GROUP = 4;
const ONE_SIZE_GROUP = 5;

// Буквенный размер: S или L, перед ними сколько-то X или число с X (2XL = XXL).
const LETTER_SIZE = /^(?:(\d+)X|(X*))([SL])$/;
const NUMERIC_SIZE = /^\d+(?:[.,]\d+)?$/;
const NUMERIC_PAIR = /^(\d+(?:[.,]\d+)?)\/(\d+(?:[.,]\d+)?)$/;
// Записи one size после normalizeTitle.
const ONE_SIZE_TITLES = new Set(["ONE SIZE", "ONESIZE", "OS", "O/S"]);

/**
 * Сравнение текста размеров: числа внутри — по значению (EU 9 < EU 10).
 * labelCollator из labelCollator.js сюда не подходит: он сравнивает числа
 * как текст (EU 10 < EU 9) и не видит слеш (31/32 для него равно 3132).
 */
const sizeCollator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

// Верхний регистр, пробелы схлопнуты, вокруг слеша убраны: « s / m » — это «S/M».
const normalizeTitle = (title) =>
	String(title ?? "")
		.trim()
		.toUpperCase()
		.replace(/\s+/g, " ")
		.replace(/ ?\/ ?/g, "/");

// Десятичная запятая равна точке: 42,5 = 42.5.
const toNumber = (text) => parseFloat(text.replace(",", "."));

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

// Ранги двух буквенных размеров через слеш в порядке записи (S/M → [-1, 0]);
// null — запись не такая.
const letterPairRanks = (title) => {
	const parts = title.split("/");
	if (parts.length !== 2) return null;
	const ranks = parts.map(letterRank);
	return ranks.includes(null) ? null : ranks;
};

// Группа размера и ранги для сравнения внутри неё.
const sizeSortKey = (title) => {
	const normalized = normalizeTitle(title);
	if (ONE_SIZE_TITLES.has(normalized)) return { group: ONE_SIZE_GROUP, ranks: [] };

	const rank = letterRank(normalized);
	if (rank !== null) return { group: LETTER_GROUP, ranks: [rank] };

	const pairRanks = letterPairRanks(normalized);
	if (pairRanks) return { group: LETTER_PAIR_GROUP, ranks: pairRanks };

	if (NUMERIC_SIZE.test(normalized)) {
		return { group: NUMERIC_GROUP, ranks: [toNumber(normalized)] };
	}

	const numericPair = NUMERIC_PAIR.exec(normalized);
	if (numericPair) {
		const [, waist, length] = numericPair;
		return { group: NUMERIC_PAIR_GROUP, ranks: [toNumber(waist), toNumber(length)] };
	}

	return { group: OTHER_GROUP, ranks: [] };
};

// Ранги сравниваются по очереди: у W/L — обхват, затем длина. В одной группе
// рангов поровну, а ключи из разных групп сюда не доходят.
const compareRanks = (ranksA, ranksB) =>
	ranksA.reduce((diff, rank, i) => diff || rank - ranksB[i], 0);

/** Сравнение названий размеров. Пригодно как компаратор для Array.prototype.sort. */
export const compareSizes = (a, b) => {
	const keyA = sizeSortKey(a);
	const keyB = sizeSortKey(b);
	return (
		keyA.group - keyB.group ||
		compareRanks(keyA.ranks, keyB.ranks) ||
		sizeCollator.compare(String(a ?? ""), String(b ?? ""))
	);
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
