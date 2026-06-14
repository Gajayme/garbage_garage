import { BorderedImage } from "Components/BorderedImage.js";

import "Styles/MainPages/DatabasePage/Items/DatabaseItem.scss";
import "Styles/TopAndLeftBorders.scss";

export const DatabaseItem = ({ value, onClick }) => {
	const imageSrc = value.images?.[0]?.image_url ?? null;
	const name = value.itemName;
	const price = value.price;

	return (
		<div className="database-page-item" onClick={onClick}>
			<BorderedImage
				className="database-page-item-image"
				imageSrc={imageSrc}
				alt="item"
			/>

			<p className="database-page-item-name" title={name}>{name}</p>
			<p className="database-page-item-price" title={price}>{price}</p>
		</div>
	);
};
