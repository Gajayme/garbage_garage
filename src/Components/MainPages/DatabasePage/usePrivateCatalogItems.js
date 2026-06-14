import { useQuery } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { fetchItems as fetchItemsRequest } from "Components/Api/fetchItems.js";
import { useAuth } from "Components/Auth/AuthContext.js";

export const usePrivateCatalogItems = () => {
	const { checkAuth } = useAuth();

	const queryFn = async ({ signal }) => {
		try {
			return await fetchItemsRequest({
				path: GlobalConstants.post_all_private,
				query: "",
				signal,
			});
		} catch (e) {
			if (e?.status === 401) {
				await checkAuth();
			}
			throw e;
		}
	};

	return useQuery({
		queryKey: [GlobalConstants.itemsPrivateQueryKey],
		queryFn,
	});
};
