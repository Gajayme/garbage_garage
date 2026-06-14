import { usePrivateCatalogItems } from "Components/MainPages/DatabasePage/usePrivateCatalogItems.js";
import { DatabaseItems } from "Components/MainPages/DatabasePage/Items/DatabaseItems.js";
import { NavButton } from "Components/Navigation/NavButton";
import * as Nav from "Components/Navigation/paths.js";

import "Styles/Navigation/NavButton.scss";
import "Styles/CenteredText.scss";

export const DatabasePage = () => {
	const { data, error, isLoading } = usePrivateCatalogItems();

	if (isLoading) {
		return <p className="centered-text">Loading...</p>;
	}

	if (error) {
		return <p className="centered-text">Error happened</p>;
	}

	const items = data?.data ?? [];

	return (
		<>
			<NavButton labelText="Add new" destination={`/${Nav.upload}`} />
			<DatabaseItems catalogState={items} />
		</>
	);
};
