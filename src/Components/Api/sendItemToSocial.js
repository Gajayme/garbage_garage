import * as GlobalConstants from "Constants.js";

const sendItem = async ({ itemID, pathBuilder }) => {
	const url = `${GlobalConstants.base_server_url}${pathBuilder(encodeURIComponent(itemID))}`;

	const resp = await fetch(url, {
		method: GlobalConstants.http_methods.POST,
		headers: { "Content-Type": "application/json" },
		credentials: "include",
	});

	if (!resp.ok) {
		const err = new Error("Failed to send");
		err.status = resp.status;
		throw err;
	}

	// Тело ответа не обязательно: успех определяется статусом.
	return resp.json().catch(() => null);
};

/**
 * Публикация вещи в Instagram.
 * Эндпоинт: POST /post/{itemID}/send-instagram
 *
 * @param {{ itemID: string|number }} params
 * @returns {Promise<unknown>} тело ответа
 */
export const sendItemToInstagram = ({ itemID }) =>
	sendItem({ itemID, pathBuilder: GlobalConstants.postSendInstagram });

/**
 * Публикация вещи в Telegram.
 * Эндпоинт: POST /post/{itemID}/send-telegram
 *
 * @param {{ itemID: string|number }} params
 * @returns {Promise<unknown>} тело ответа
 */
export const sendItemToTelegram = ({ itemID }) =>
	sendItem({ itemID, pathBuilder: GlobalConstants.postSendTelegram });
