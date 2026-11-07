import * as GlobalConstants from "Constants.js";

/**
 * Запрос ссылки на WhatsApp для конкретной вещи.
 * Эндпоинт: GET /post/{itemID}/whatsapp-link
 *
 * @param {{ itemID: string|number, signal?: AbortSignal }} params
 * @returns {Promise<unknown>} тело ответа ({ status, message, data: { url, deviceType } })
 */
export const fetchWhatsappLink = async ({ itemID, signal }) => {
	const url = `${GlobalConstants.base_server_url}${GlobalConstants.postWhatsappLink(itemID)}`;

	const resp = await fetch(url, {
		method: GlobalConstants.http_methods.GET,
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
