import { useState } from "react";
import { useParams } from "react-router-dom";

import { ItemPageBigScreen } from "./ItemPageBigScreen.js";
import { ItemPageSmallScreen } from "./ItemPageSmallScreen.js";
import { ItemModalWindow } from "./ItemModalWindow.js";
import { buildItemData } from "./Utils.js";
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

	const itemData = buildItemData(data ? data.data : null);
	const images = data ? data.data.images : null;

	if (!itemData) {
		return <p className="centered-text">No item data</p>;
	}

	return (
		<div className="catalog-item-page">
			{tallNarrowViewport ? (
				<ItemPageSmallScreen
					itemData={itemData}
					images={images}
					onImageClick={setModalImageUrl}
					whatsappLink={whatsappLink}
				/>
			) : (
				<ItemPageBigScreen
					itemData={itemData}
					images={images}
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
