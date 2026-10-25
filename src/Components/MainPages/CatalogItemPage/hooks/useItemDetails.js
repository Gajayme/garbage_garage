import { useQuery } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { fetchItemDetails } from "Components/Api/fetchItemDetails.js";
import { isValidPostId } from "Components/utils/isValidPostId.js";

const fetchItemDetailsQueryFn = async ({ queryKey, signal }) => {
	const [, itemID] = queryKey;
	return fetchItemDetails({
		buildPath: GlobalConstants.postDetail,
		itemID,
		signal,
	});
};

export const useItemDetails = (itemID) => {
	return useQuery({
		queryKey: [GlobalConstants.itemDetailsQueryKey, itemID],
		queryFn: fetchItemDetailsQueryFn,
		staleTime: GlobalConstants.staleTimes.details,
		// Мусорный id сервер всё равно отвергнет, так что в сеть не идём.
		// Страница показывает такой id как «вещи нет» до гейта загрузки,
		// поэтому отключённый запрос в «Loading...» не превращается.
		enabled: isValidPostId(itemID),
	});
};
