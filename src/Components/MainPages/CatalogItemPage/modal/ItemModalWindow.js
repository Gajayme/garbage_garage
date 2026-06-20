import "Styles/MainPages/CatalogItemPage/ItemModalWindow.scss";
import { ModalWindowImage } from "./ModalWindowImage.js";

export const ItemModalWindow = ({ imageUrl, onClose }) => {

	if (!imageUrl) return null;

	return (
		<div
			className="catalog-item-page-modal-overlay"
			onClick={onClose}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === "Escape" && onClose()}
			aria-label="Close modal"
		>
			<ModalWindowImage
				imageUrl={imageUrl}
				onCrossClick={() => onClose()}
				onClick={(e) => e.stopPropagation()}
			/>
		</div>
	);
};
