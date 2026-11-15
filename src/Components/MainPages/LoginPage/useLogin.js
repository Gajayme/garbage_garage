import { useMutation } from "@tanstack/react-query";
import * as Constants from "Constants.js";
import { useAuth } from "Components/Auth/useAuth.js";

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
	const { checkAuth } = useAuth();

	return useMutation({
		mutationFn: loginRequest,
		// Вход завершён, когда сессия перепроверена. Поэтому checkAuth стоит
		// в onSuccess хука, а не в onSuccess вызова mutate: этот TanStack Query
		// дожидается, и isPending держит кнопку входа заблокированной до ответа
		// user/me. Иначе кнопка оживает между ответом на вход и ответом
		// user/me, и повторное нажатие отправляет второй вход и второй переход.
		onSuccess: () => checkAuth(),
	});
};
