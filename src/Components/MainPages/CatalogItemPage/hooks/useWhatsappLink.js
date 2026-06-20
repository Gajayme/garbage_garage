import { useQuery } from "@tanstack/react-query";
import * as GlobalConstants from "Constants.js";
import { fetchWhatsappLink } from "Components/Api/fetchWhatsappLink.js";

const fetchWhatsappLinkQueryFn = async ({ queryKey, signal }) => {
	const [, itemID] = queryKey;
	return fetchWhatsappLink({ itemID, signal });
};

export const useWhatsappLink = (itemID) => {
	return useQuery({
		queryKey: [GlobalConstants.whatsappLinkQueryKey, itemID],
		queryFn: fetchWhatsappLinkQueryFn,
		enabled: itemID != null && itemID !== "",
	});
};
