import { useCallback } from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Constants from "Constants.js";
import { fetchSession } from "Components/Api/fetchSession.js";

// Перепроверять стоит только сессию админа: у гостя проверять нечего, а каждый
// посетитель магазина слал бы user/me на каждом переходе и возвращении на
// вкладку. Гостя проверяем один раз, при загрузке; после логина проверку
// запускает checkAuth.
const onlyForAdmin = (query) => query.state.data?.isAdmin === true;

const sessionQuery = queryOptions({
	queryKey: [Constants.sessionQueryKey],
	queryFn: fetchSession,
	staleTime: Constants.staleTimes.session,
	// Каждый вызов useAuth подписывает компонент на этот запрос, в том числе
	// AdminRouteGuard, который монтируется заново на каждой админской странице
	// (key в buildRouterRoutes). Поэтому вход на неё перепроверяет сессию,
	// если проверке больше staleTimes.session: кеш данных страницы может быть
	// ещё свежим, и без этого она откроется на истёкшей сессии, не сделав ни
	// одного запроса. Возвращение на вкладку — момент, когда админ приходит
	// к давно открытой странице, обычно уже после истечения сессии.
	refetchOnMount: onlyForAdmin,
	refetchOnWindowFocus: onlyForAdmin,
	refetchOnReconnect: onlyForAdmin,
});

/**
 * Сессия админа.
 *
 * @returns {{
 *   isAdmin: boolean,
 *   hasChecked: boolean,
 *   checkAuth: () => Promise<void>,
 * }}
 *   `hasChecked` отличает «сервер ещё ни разу не ответил» от «перепроверяем
 *   уже известное»: первое требует придержать рендер админской страницы,
 *   второе — нет (см. AdminRouteGuard). Он становится true и тогда, когда
 *   первая проверка провалилась после всех повторов: при недоступном бэкенде
 *   админская страница уходит на логин, а не остаётся пустой.
 *
 *   `checkAuth` перепроверяет сессию сразу, не глядя на staleTime: его зовут
 *   обработчики 401 и логин.
 */
export const useAuth = () => {
	const queryClient = useQueryClient();
	const { data, isPending } = useQuery(sessionQuery);

	const checkAuth = useCallback(async () => {
		const { queryKey } = sessionQuery;
		// Проверка в полёте могла уйти до логина, и её «гость» отправил бы
		// только что вошедшего админа обратно на логин, поэтому её заменяем
		// новой. Когда ответ в кеше уже есть, это делает invalidateQueries
		// (cancelRefetch): отменяет её тихо, и все, кто её ждал, получают
		// ответ новой. Первую проверку он не отменяет, а присоединяется к ней,
		// поэтому её отменяем сами. При ответе в кеше cancelQueries звать
		// нельзя: он откатывает кеш к прежнему ответу и отпускает ждущих
		// с ним — повторное нажатие «Login» вернуло бы первый checkAuth
		// с «гостем», и гард на мгновение увёл бы на логин.
		if (queryClient.getQueryData(queryKey) === undefined) {
			await queryClient.cancelQueries({ queryKey });
		}
		// Перезапрашиваются только активные запросы, а этот активен всегда:
		// AuthChecker и AdminLabel смонтированы в оболочке окна постоянно.
		await queryClient.invalidateQueries({ queryKey });
	}, [queryClient]);

	return {
		isAdmin: data?.isAdmin === true,
		hasChecked: !isPending,
		checkAuth,
	};
};
