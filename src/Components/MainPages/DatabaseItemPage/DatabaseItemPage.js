import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { DefaultButton } from "Components/Button.js";
import { useAuth } from "Components/Auth/AuthContext.js";
import * as Nav from "Components/Navigation/paths.js";
import * as Constants from "Constants.js";

import { ItemImageGrid } from "./ItemImageGrid.js";
import { ItemDescription } from "./ItemDescription.js";
import { ItemModalWindow } from "./ItemModalWindow.js";
import { buildItemData } from "./Utils.js";
import { useItemDetailsPrivate } from "Components/hooks/useItemDetailsPrivate.js";

import "Styles/MainPages/DatabaseItemPage/ImagesAndDescriptionWrapper.scss";
import "Styles/CenteredText.scss";

export const DatabaseItemPage = () => {
	const { itemId } = useParams();
	const [modalImageUrl, setModalImageUrl] = useState(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { checkAuth } = useAuth();

	const { data, isFetching, error } = useItemDetailsPrivate(itemId);

	const handleDeleteItem = async () => {
		if (!itemId || isDeleting) return;
		if (!window.confirm("Удалить эту вещь?")) return;

		setIsDeleting(true);
		try {
			const response = await fetch(
				`${Constants.base_server_url}${Constants.post_delete}/${encodeURIComponent(itemId)}`,
				{
					method: Constants.http_methods.DELETE,
					credentials: "include",
				}
			);

			if (response.status === 401) {
				await checkAuth();
				return;
			}

			if (!response.ok) {
				console.error("Delete failed:", response.status);
				return;
			}
			// Инвалидируем все в бд и в каталоге
			await queryClient.invalidateQueries({ queryKey: [Constants.itemsQueryKey] });
			await queryClient.invalidateQueries({queryKey: [Constants.itemsPrivateQueryKey],
			});
			navigate(`/${Nav.database}`);
		} finally {
			setIsDeleting(false);
		}
	};

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

	const handleEditItem = () => {
		if (!itemId) return;
		navigate(`/${Nav.upload}/edit/${encodeURIComponent(itemId)}`);
	};

	return (
		<div className="images-and-description-wrapper">
			<ItemImageGrid images={images} onImageClick={setModalImageUrl} />
			<div className="database-item-detail-column">
				<ItemDescription data={itemData} />
				<DefaultButton
					className="database-item-button"
					type="button"
					labelText={"Delete"}
					disabled={isDeleting}
					onClick={handleDeleteItem}
				/>
				<DefaultButton
					className="database-item-button"
					type="button"
					labelText={"Edit"}
					disabled={!itemId}
					onClick={handleEditItem}
				/>
			</div>
			<ItemModalWindow
				imageUrl={modalImageUrl}
				onClose={() => setModalImageUrl(null)}
			/>
		</div>
	);
};
