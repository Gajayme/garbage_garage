import { useQuery, keepPreviousData } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { fetchItems as fetchItemsRequest } from "Components/Api/fetchItems.js";
import { buildQueryString } from "./Utils.js";

// Строку запроса берём из ключа, а не из замыкания: так ключ и запрос
// не могут разойтись.
const fetchItems = async ({ queryKey, signal }) => {
	const [, queryString] = queryKey;
	return fetchItemsRequest({
		path: GlobalConstants.post_all,
		query: queryString,
		signal,
	});
};

export const useCatalogItems = (filtersState) => {
	// Ключ — строка запроса, а не объект фильтров. До инициализации useUrlFilters
	// состояние равно {}, после — объекту с пустыми значениями по умолчанию:
	// ключи разные, а запрос одинаковый, поэтому на объекте каталог грузился
	// дважды при каждом заходе. Строка склеивает такие состояния в одну запись
	// кеша. Порядок ключей в строке важен, но он стабилен: все состояния
	// собираются в порядке filtersDefinition (см. useUrlFilters).
	const query = buildQueryString(filtersState);

	const { data, error, isLoading, isPlaceholderData } = useQuery({
		queryKey: [GlobalConstants.itemsQueryKey, query],
		queryFn: fetchItems,
		placeholderData: keepPreviousData,
	});

	return { data, error, isLoading, isPlaceholderData };
};
