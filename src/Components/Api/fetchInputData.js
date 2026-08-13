import * as Constants from "Constants.js";

// Получение input данных (какие есть бренды, типы, покупатели, местоположения)
export async function fetchInputData(path) {
	const url = `${Constants.base_server_url}${path}`;
	const resp = await fetch(url, { credentials: "include" });
	if (!resp.ok) throw new Error("Failed to load");
	const data = await resp.json();
	return data.data;
}
