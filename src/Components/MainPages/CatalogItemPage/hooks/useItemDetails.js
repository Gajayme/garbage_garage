import { useQuery } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { fetchItemDetails } from "Components/Api/fetchItemDetails.js";

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
		enabled: itemID != null && itemID !== "",
	});
};
