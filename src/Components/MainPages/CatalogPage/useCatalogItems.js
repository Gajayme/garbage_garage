import { useQuery } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { fetchItems as fetchItemsRequest } from "Components/Api/fetchItems.js";
import { buildQueryString } from "./Utils.js";

export const useCatalogItems = (filtersState) => {
	const fetchItems = async ({ signal }) => {
		const query = buildQueryString(filtersState);
		return fetchItemsRequest({
			path: GlobalConstants.post_all,
			query,
			signal,
		});
	};

	const { data, error, isLoading } = useQuery({
		queryKey: [GlobalConstants.itemsQueryKey, filtersState],
		queryFn: fetchItems,
		keepPreviousData: true,
	});

	return { data, error, isLoading };
};
