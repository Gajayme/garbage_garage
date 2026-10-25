import * as Constants from "Constants.js";

// Получение input данных (какие есть бренды, типы, покупатели, местоположения)
export async function fetchInputData(path) {
	const url = `${Constants.base_server_url}${path}`;
	const resp = await fetch(url, { credentials: "include" });
	if (!resp.ok) {
		const err = new Error("Failed to load");
		err.status = resp.status;
		throw err;
	}
	const data = await resp.json();
	return data.data;
}
