
import { Link } from "react-router-dom";
import { Item } from 'Components/MainPages/CatalogPage/Items/Item';
import { validateItem } from 'Components/MainPages/CatalogPage/Items/validate';
import * as NavigationConstants from "Components/Navigation/paths.js";

import "Styles/NoDecorationTextLink.scss";

export const Items = ({catalogState}) => {

	if (catalogState.length === 0) {
		return (
			<p className="centered-text">{"Nothing here ..."}</p>
		);
	}

	return (
		<div className="catalog-page-items"> {
			catalogState.map((value, index) => {
				if (!validateItem(value)) {
					return null;
				}

				return (
					<Link
						key={index}
						className="no-decoration-text-link"
						to={`/${NavigationConstants.catalog}/${value.id}`}>

						<Item value={value} />

					</Link>
				)
			})
		} </div>
	)
}
