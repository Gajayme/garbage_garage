import { Link } from "react-router-dom";
import { DatabaseItem } from "Components/MainPages/DatabasePage/Items/DatabaseItem.js";
import * as NavigationConstants from "Components/Navigation/paths.js";

import "Styles/NoDecorationTextLink.scss";
import "Styles/MainPages/DatabasePage/Items/DatabaseItems.scss";
import "Styles/CenteredText.scss";

export const DatabaseItems = ({ catalogState }) => {
	if (catalogState.length === 0) {
		return <p className="centered-text">Nothing here ...</p>;
	}

	return (
		<div className="database-page-items">
			{catalogState.map((value, index) => (
				<Link
					key={index}
					className="no-decoration-text-link"
					to={`/${NavigationConstants.database}/${value.id}`}
				>
					<DatabaseItem value={value} />
				</Link>
			))}
		</div>
	);
};
