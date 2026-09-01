/**
 * Единый порядок сортировки видимых пользователю подписей: списки брендов,
 * типов, покупателей и т.д. должны идти по алфавиту одинаково на всех экранах.
 *
 * Опции подобраны так, чтобы совпадать с коллацией бэкенда:
 *   - sensitivity: 'base'  — регистр и диакритика не влияют на порядок
 *                            ("Fjällräven" встаёт между "Etudes" и "Gildan");
 *   - ignorePunctuation    — точки и апострофы не участвуют в сравнении
 *                            ("Carhartt" < "C.P. Company", "Levi's" < "LFDY").
 *
 * Intl.Collator дорог в создании, поэтому экземпляр один на всё приложение.
 */
export const labelCollator = new Intl.Collator("en", {
	sensitivity: "base",
	ignorePunctuation: true,
});

/** Сравнение подписей по алфавиту. Пригодно как компаратор для Array.prototype.sort. */
export const compareLabels = (a, b) => labelCollator.compare(a ?? "", b ?? "");
