import { useQuery } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { fetchItemDetails } from "Components/Api/fetchItemDetails.js";

const fetchItemDetailsQueryFn = async ({ queryKey, signal }) => {
	const [, itemID] = queryKey;
	return fetchItemDetails({
		endpointPath: GlobalConstants.post_detail,
		itemID,
		signal,
	});
};

export const useItemDetails = (itemID) => {
	return useQuery({
		queryKey: [GlobalConstants.itemDetailsQueryKey, itemID],
		queryFn: fetchItemDetailsQueryFn,
		enabled: itemID != null && itemID !== "",
	});
};
