import * as Constants from "Constants.js";

/**
 * @param {object} options
 * @param {string} options.path - e.g. Constants.post_all
 * @param {string} [options.query] - pre-built query string (no leading ?)
 * @param {AbortSignal} [options.signal]
  * @returns {Promise<unknown>} parsed JSON body
 */
export async function fetchItems({ path, query = "", signal }) {
	const q = typeof query === "string" ? query : "";
	const url =
		q.length > 0
			? `${Constants.base_server_url}${path}?${q}`
			: `${Constants.base_server_url}${path}`;

	const init = {
		method: Constants.http_methods.GET,
		signal,
		credentials: "include",
	};

	const resp = await fetch(url, init);
	if (!resp.ok) {
		const err = new Error("Failed to fetch");
		err.status = resp.status;
		throw err;
	}
	return resp.json();
}
