import { useState } from "react";
import { useParams } from "react-router-dom";

import { useItemDetailsPrivate } from "Components/hooks/useItemDetailsPrivate.js";
import { StatusNotificationWindow } from "Components/StatusNotificationWindow.js";

import { ItemImageGrid } from "./ItemImageGrid.js";
import { ItemDescription } from "./ItemDescription.js";
import { ItemModalWindow } from "./ItemModalWindow.js";
import { ItemActionButtons } from "./ItemActionButtons.js";
import { useItemActions } from "./useItemActions.js";
import { buildItemData } from "./Utils.js";

import "Styles/MainPages/DatabaseItemPage/ImagesAndDescriptionWrapper.scss";
import "Styles/CenteredText.scss";

export const DatabaseItemPage = () => {
	const { itemId } = useParams();
	const [modalImageUrl, setModalImageUrl] = useState(null);
	const { notification, actions } = useItemActions(itemId);
	const { data, isPending, error } = useItemDetailsPrivate(itemId);

	const renderContent = () => {
		if (isPending) {
			return <p className="centered-text">Loading...</p>;
		}

		if (error) {
			return (
				<p className="centered-text">Error while loading item details</p>
			);
		}

		const itemData = buildItemData(data ? data.data : null);
		const images = data ? data.data.images : null;

		return (
			<div className="database-item-page-layout">
				<ItemImageGrid images={images} onImageClick={setModalImageUrl} />
				<div className="database-item-detail-column">
					<ItemDescription data={itemData} />
					<ItemActionButtons actions={actions} />
				</div>
				<ItemModalWindow
					imageUrl={modalImageUrl}
					onClose={() => setModalImageUrl(null)}
				/>
			</div>
		);
	};

	return (
		<>
			{renderContent()}
			<StatusNotificationWindow notification={notification} />
		</>
	);
};
