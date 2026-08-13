import * as GlobalConstants from "Constants.js";

export const deleteSettingRequest = async ({ apiPath, id }) => {
	const response = await fetch(
		`${GlobalConstants.base_server_url}${GlobalConstants.withId(apiPath, id)}`,
		{
			method: GlobalConstants.http_methods.DELETE,
			credentials: "include",
		}
	);

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.message || `Error: ${response.status}`);
	}
	if (response.status === 204 || response.headers.get("content-length") === "0") {
		return null;
	}
	return response.json().catch(() => null);
};
