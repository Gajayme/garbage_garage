import * as GlobalConstants from "Constants.js";

/**
 * Общий запрос на получение данных о вещи.
 * Путь собирает билдер из Constants.js (`postDetail` или `postDetailPrivate`).
 *
 * @param {{
 * 	buildPath: (itemID: string|number) => string,
 * 	itemID: string|number,
 * 	signal?: AbortSignal
 * }} params
 */
export const fetchItemDetails = async ({ buildPath, itemID, signal }) => {
	const url = `${GlobalConstants.base_server_url}${buildPath(itemID)}`;

	const resp = await fetch(url, {
		method: GlobalConstants.http_methods.GET,
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		signal,
	});

	if (!resp.ok) {
		const err = new Error("Failed to fetch");
		err.status = resp.status;
		throw err;
	}

	const json = await resp.json();

	// Отсутствие вещи приходит кодом 200 и телом `{status: false}`, поэтому
	// распознать его можно только по конверту. Пустое `data` трактуем так же:
	// у успешного ответа детали вещь есть всегда, и как бы её отсутствие
	// ни было названо в конверте, означает оно одно. Приводим к ошибке 404,
	// чтобы у вызывающей стороны был один признак «вещи нет», а не три.
	if (json?.status === false || json?.data == null) {
		const err = new Error(json?.message ?? "Not found");
		err.status = 404;
		throw err;
	}

	return json;
};

