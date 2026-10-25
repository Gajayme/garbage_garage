import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { useItemDetailsPrivate } from "Components/hooks/useItemDetailsPrivate.js";
import { StatusNotificationWindow } from "Components/StatusNotificationWindow.js";
import { isValidPostId } from "Components/utils/isValidPostId.js";
import * as Nav from "Components/Navigation/paths.js";

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
	const { data, isPending, isFetching, isPaused, error } =
		useItemDetailsPrivate(itemId);

	// Мусорный id в URL: показывать нечего, уводим в список базы.
	// Ранний return — после всех хуков, чтобы их количество было стабильным
	// между рендерами.
	if (!isValidPostId(itemId)) {
		return <Navigate to={`/${Nav.database}`} replace />;
	}

	const renderContent = () => {
		if (isPending) {
			// Пауза без сети не даёт ни данных, ни ошибки: status остаётся
			// pending. Проверка живёт внутри этой ветки, потому что на фоновом
			// рефетче пауза застаёт данные уже на экране — их показ важнее.
			return (
				<p className="centered-text">
					{isPaused ? "No connection" : "Loading..."}
				</p>
			);
		}

		// 404 — не сбой, а ответ: записи с таким id в базе нет. Проверка идёт
		// до данных, потому что вещь могли удалить при открытой карточке:
		// в кеше ещё лежит прошлый успех, но показывать его уже нельзя.
		if (error?.status === 404) {
			return <p className="centered-text">Item not found</p>;
		}

		// Сообщение о сбое занимает страницу, только когда показывать больше
		// нечего. Упавшее обновление оставляет данные прошлого успеха, а
		// вместе с ними — кнопки действий, которым нужен только id из URL.
		if (error && !data) {
			return (
				<p className="centered-text">Error while loading item details</p>
			);
		}

		const itemData = buildItemData(data?.data ?? null);
		const images = data?.data?.images ?? null;

		return (
			<div className="database-item-page-layout" aria-busy={isFetching}>
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
