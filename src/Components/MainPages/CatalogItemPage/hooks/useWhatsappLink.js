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
		// Ссылка собирается из данных вещи, поэтому живёт по тому же порогу,
		// что и сама карточка.
		staleTime: GlobalConstants.staleTimes.details,
		enabled: itemID != null && itemID !== "",
	});
};
