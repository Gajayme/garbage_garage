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

export const useItemDetailsPrivate = (itemID) => {
	const { checkAuth } = useAuth();

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
		enabled: itemID != null && itemID !== "",
	});
};
