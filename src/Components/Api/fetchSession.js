import * as Constants from "Constants.js";

// Кто открыл приложение: админ или гость.
//
// 401 — не сбой, а ответ на вопрос: так сервер отвечает гостю и истёкшей
// сессии. Остальные провалы (5xx, 429 от Cloudflare, сеть) бросаются как
// ошибка с `.status`: не удалось проверить — не значит «не админ». На ошибке
// фоновой перепроверки TanStack Query оставляет прежний ответ, и сбой бэкенда
// не выкидывает админа на логин посреди работы.
export async function fetchSession({ signal }) {
	const resp = await fetch(`${Constants.base_server_url}${Constants.user_me}`, {
		method: Constants.http_methods.GET,
		credentials: "include",
		signal,
	});
	if (resp.status === 401) {
		return { isAdmin: false };
	}
	if (!resp.ok) {
		const err = new Error("Failed to check session");
		err.status = resp.status;
		throw err;
	}
	const data = await resp.json();
	return { isAdmin: data?.status === true && data?.data != null };
}
