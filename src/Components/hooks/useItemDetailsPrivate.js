import { useQuery } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { useAuth } from "Components/Auth/AuthContext.js";
import { fetchItemDetails } from "Components/Api/fetchItemDetails.js";

const fetchItemDetailsPrivate = async ({ queryKey, signal }) => {
	const [, itemID] = queryKey;
	return fetchItemDetails({
		buildPath: GlobalConstants.postDetailPrivate,
		itemID,
		signal,
	});
};

/**
 * Детали вещи для приватных страниц.
 *
 * Хук не принимает опции useQuery целиком: ключ должен совпадать с тем, что
 * инвалидируют invalidateItem/removeItem и разбирает fetchItemDetailsPrivate,
 * queryFn несёт обработку 401, а enabled охраняет запрос от пустого id. Наружу
 * вынесено только то, что вызывающему действительно нужно менять; если
 * понадобится ещё опция — её добавляют сюда явным параметром.
 *
 * @param {string} itemID - Id вещи.
 * @param {object|null} [options] - Настройки запроса; `null` и `undefined`
 *   означают «настроек нет».
 * @param {boolean|"always"} [options.refetchOnMount] - Как обновлять данные при
 *   маунте; "always" — всегда идти на сервер, не считаясь со свежестью кеша.
 */
export const useItemDetailsPrivate = (itemID, options) => {
	const { checkAuth } = useAuth();
	const { refetchOnMount } = options ?? {};

	return useQuery({
		queryKey: [GlobalConstants.itemDetailsPrivateQueryKey, itemID],

		// проверяем, авторизован ли пользователь
		queryFn: async (ctx) => {
			try {
				return await fetchItemDetailsPrivate(ctx);
			} catch (e) {
				if (e?.status === 401) {
					await checkAuth();
				}
				throw e;
			}
		},
		staleTime: GlobalConstants.staleTimes.details,
		refetchOnMount,
		enabled: itemID != null && itemID !== "",
	});
};
