import { useState } from "react";
import { useParams } from "react-router-dom";

import { ItemPageBigScreen } from "./ItemPageBigScreen.js";
import { ItemPageSmallScreen } from "./ItemPageSmallScreen.js";
import { ItemModalWindow } from "./ItemModalWindow.js";
import { validateItemData } from "./Utils.js";
import { useItemDetails } from "./useItemDetails.js";
import { useWhatsappLink } from "./useWhatsappLink.js";
import { useHeightGreaterThanWidth } from "./useHeightGreaterThanWidth.js";

import "Styles/MainPages/CatalogItemPage/ItemPage.scss";
import "Styles/CenteredText.scss";

export const ItemPage = () => {
	const { itemId } = useParams();
	const [modalImageUrl, setModalImageUrl] = useState(null);
	const tallNarrowViewport = useHeightGreaterThanWidth();
	const { data, isFetching, error } = useItemDetails(itemId);
	const { data: whatsappData } = useWhatsappLink(itemId);
	const whatsappLink = whatsappData?.data?.url ?? null;

	if (isFetching) {
		return <p className="centered-text">Loading...</p>;
	}

	if (error) {
		return (
			<p className="centered-text">Error while loading item details</p>
		);
	}

	// Вытащим данные из response и проверим их на валидность
	const itemData = data.data ? data.data : null;
	const isDataValid = validateItemData(itemData);

	// Если данные не валидны, то выводим сообщение об ошибке
	if (!isDataValid) {
		return <p className="centered-text">No item data</p>;
	}

	return (
		<div className="catalog-item-page">
			{tallNarrowViewport ? (
				<ItemPageSmallScreen
					itemData={itemData}
					onImageClick={setModalImageUrl}
					whatsappLink={whatsappLink}
				/>
			) : (
				<ItemPageBigScreen
					itemData={itemData}
					onImageClick={setModalImageUrl}
					whatsappLink={whatsappLink}
				/>
			)}

			<ItemModalWindow
				imageUrl={modalImageUrl}
				onClose={() => setModalImageUrl(null)}
			/>
		</div>
	);
};
