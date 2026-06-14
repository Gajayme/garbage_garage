import { ItemThumbnailButton } from "Components/ItemThumbnailButton.js";

import "Styles/MainPages/DatabaseItemPage/ItemImageGrid.scss";


export const ItemImageGrid = ({ images, onImageClick }) => {
	if (!images) return null;

	return (
		<div className="database-item-page-image-grid">
			{images.map((imageData, index) => {
				const imageUrl = imageData ? imageData.image_url : null;
				return (
					<ItemThumbnailButton
						key={index}
						imageSrc={imageUrl}
						onImageClick={onImageClick}
						buttonClassName="database-item-page-image-grid-button"
						imageClassName="database-item-page-image-grid-thumb"
					/>
				);
			})}
		</div>
	);
};
