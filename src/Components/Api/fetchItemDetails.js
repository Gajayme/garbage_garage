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

	return resp.json();
};

