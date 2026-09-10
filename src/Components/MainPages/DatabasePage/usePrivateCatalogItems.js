import { useQuery, keepPreviousData } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { fetchItems as fetchItemsRequest } from "Components/Api/fetchItems.js";
import { useAuth } from "Components/Auth/AuthContext.js";
import { buildQueryString } from "Components/Filters/filterQueryString.js";

export const usePrivateCatalogItems = (filtersState) => {
	const { checkAuth } = useAuth();

	// Ключ — строка запроса, а не объект фильтров: до инициализации useUrlFilters
	// состояние равно {}, после — объекту с пустыми значениями по умолчанию.
	// Строка склеивает такие состояния в одну запись кеша. См. useCatalogItems.
	const query = buildQueryString(filtersState);

	// Строку запроса берём из ключа, а не из замыкания: ключ и запрос не разойдутся.
	const queryFn = async ({ queryKey, signal }) => {
		const [, queryString] = queryKey;
		try {
			return await fetchItemsRequest({
				path: GlobalConstants.post_all_private,
				query: queryString,
				signal,
			});
		} catch (e) {
			if (e?.status === 401) {
				await checkAuth();
			}
			throw e;
		}
	};

	const { data, error, isLoading, isPlaceholderData } = useQuery({
		queryKey: [GlobalConstants.itemsPrivateQueryKey, query],
		queryFn,
		placeholderData: keepPreviousData,
	});

	return { data, error, isLoading, isPlaceholderData };
};
