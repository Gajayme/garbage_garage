import * as GlobalConstants from "Constants.js";

/**
 * Удаление вещи.
 * Эндпоинт: DELETE /post/delete/{itemID}
 *
 * @param {{ itemID: string|number }} params
 */
export const deleteItem = async ({ itemID }) => {
	const url = `${GlobalConstants.base_server_url}${GlobalConstants.postDelete(itemID)}`;

	const resp = await fetch(url, {
		method: GlobalConstants.http_methods.DELETE,
		credentials: "include",
	});

	if (!resp.ok) {
		const err = new Error("Failed to delete");
		err.status = resp.status;
		throw err;
	}
};
