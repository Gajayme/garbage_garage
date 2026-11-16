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
		// 422 — значения не прошли проверку формата на сервере (например, пароль
		// короче 4 символов): для формы входа это те же неверные данные.
		if (response.status === 401 || response.status === 422) {
			throw new Error("Invalid login or password");
		}
		// Остальные отказы (429, 5xx): бэкенд кладёт пояснение в `detail`,
		// показываем его, если это строка.
		throw new Error(typeof data.detail === "string" ? data.detail : `Error: ${response.status}`);
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
