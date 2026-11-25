import * as GlobalConstants from "Constants.js";

export const addSettingRequest = async ({ apiPath, body }) => {
	const response = await fetch(GlobalConstants.base_server_url + apiPath, {
		method: GlobalConstants.http_methods.POST,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		credentials: "include",
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.message || `Error: ${response.status}`);
	}
	return response.json();
};
