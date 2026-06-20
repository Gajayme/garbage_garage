import { ItemThumbnailButton } from "Components/ItemThumbnailButton.js";

import "Styles/MainPages/CatalogItemPage/ItemImageGrid.scss";


export const ItemImageGrid = ({ images, onImageClick }) => {
	if (!images) return null;

	return (
		<div className="catalog-item-page-image-grid">
			{images.map((imageData, index) => {
				const imageUrl = imageData ? imageData.image_url : null;
				return (
					<ItemThumbnailButton
						key={index}
						imageSrc={imageUrl}
						onImageClick={onImageClick}
						buttonClassName="catalog-item-page-image-grid-button"
						imageClassName="catalog-item-page-image-grid-thumb"
					/>
				);
			})}
		</div>
	);
};
