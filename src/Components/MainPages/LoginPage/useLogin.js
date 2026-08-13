import { useMutation } from "@tanstack/react-query";
import * as Constants from "Constants.js";

const loginRequest = async ({ login, password }) => {
	const response = await fetch(Constants.base_server_url + Constants.user_login, {
		method: Constants.http_methods.POST,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ login, password }),
		credentials: 'include',
	});

	if (!response.ok) {
		const data = await response.json().catch(() => ({}));
		throw new Error(data.message || `Error: ${response.status}`);
	}
	return response.json();
};

export const useLogin = () => {
	return useMutation({
		mutationFn: loginRequest,
	});
};
