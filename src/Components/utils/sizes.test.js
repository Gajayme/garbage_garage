import { compareSizes } from "Components/utils/sizes.js";

const sortSizes = (titles) => [...titles].sort(compareSizes);

// Размеры из всех групп в правильном порядке.
const ALL_GROUPS = [
	"XS", "S", "M", "L", "XL", "2XL", "3XL",
	"XS/S", "S/M", "L/XL",
	"30", "31", "34", "36", "40",
	"30/32", "31/31", "32/32", "34/34",
	"EU 9", "EU 10",
	"one size",
];

describe("compareSizes", () => {
	test("буквенные — как на бирках", () => {
		expect(sortSizes(["XL", "S", "3XL", "M", "XS", "L", "2XL", "XXS"])).toEqual([
			"XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL",
		]);
	});

	test("XXL и 2XL одного ранга и стоят рядом", () => {
		expect(sortSizes(["3XL", "XXL", "XL", "2XL"])).toEqual(["XL", "2XL", "XXL", "3XL"]);
	});

	test("регистр и пробелы по краям и вокруг слеша не влияют на группу", () => {
		expect(sortSizes([" xl", "s ", "One Size", "32 / 30", "m"])).toEqual([
			"s ", "m", " xl", "32 / 30", "One Size",
		]);
	});

	test("числа — по значению, десятичная запятая равна точке", () => {
		expect(sortSizes(["10", "42,5", "9", "43", "42.25"])).toEqual([
			"9", "10", "42.25", "42,5", "43",
		]);
	});

	test("W/L — отдельно от чисел, по обхвату, затем по длине", () => {
		expect(sortSizes(["34/34", "32", "31/32", "30/32", "30", "32/30", "31/31"])).toEqual([
			"30", "32", "30/32", "31/31", "31/32", "32/30", "34/34",
		]);
	});

	test("буквенные через слеш — сразу после буквенных, по рангу", () => {
		expect(sortSizes(["30", "L/XL", "XL", "M/L", "S/M", "S", "XS/S"])).toEqual([
			"S", "XL", "XS/S", "S/M", "M/L", "L/XL", "30",
		]);
	});

	test("слеш сам по себе не делает размер парой W/L", () => {
		// 7 1/4 — размер кепки, O/S — one size, S/M — буквенные через слеш.
		expect(sortSizes(["O/S", "7 1/4", "30/32", "S/M"])).toEqual([
			"S/M", "30/32", "7 1/4", "O/S",
		]);
	});

	test("всё остальное — по тексту, числа в нём по значению", () => {
		expect(sortSizes(["W31 L32", "EU 10", "W30 L34", "EU 9"])).toEqual([
			"EU 9", "EU 10", "W30 L34", "W31 L32",
		]);
	});

	test.each(["one size", "One Size", "ONESIZE", "os", "O/S"])("«%s» — в конце", (oneSize) => {
		expect(sortSizes([oneSize, "LT", "EU 9", "S/M", "XS"]).at(-1)).toBe(oneSize);
	});

	test("группы не перемешиваются", () => {
		expect(sortSizes([...ALL_GROUPS].reverse())).toEqual(ALL_GROUPS);
	});

	test("с переставленными аргументами знак результата обратный", () => {
		// Иначе Array.prototype.sort выдаёт порядок, зависящий от исходного.
		const titles = [...ALL_GROUPS, "XXL", "xl", "32 / 30", "7 1/4", "O/S", "LT", ""];
		const asymmetric = [];
		titles.forEach((a) =>
			titles.forEach((b) => {
				if (Math.sign(compareSizes(a, b)) !== -Math.sign(compareSizes(b, a))) {
					asymmetric.push([a, b]);
				}
			})
		);
		expect(asymmetric).toEqual([]);
	});
});
