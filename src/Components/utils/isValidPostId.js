/**
 * Валидация id вещи из URL-параметра `:itemId`.
 *
 * Считаем валидным только строго положительное целое в десятичной записи —
 * чтобы строки вроде "12abc" (которые `parseInt` молча превращает в 12)
 * не проходили как корректные id.
 *
 * @param {unknown} v
 * @returns {boolean}
 */
export const isValidPostId = (v) => {
	if (v == null) return false;
	const s = String(v);
	if (!/^\d+$/.test(s)) return false;
	return parseInt(s, 10) >= 1;
};
