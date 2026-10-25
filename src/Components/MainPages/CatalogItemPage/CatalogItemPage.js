import { useState } from "react";
import { useParams } from "react-router-dom";

import { ItemPageBigScreen } from "./layouts/ItemPageBigScreen.js";
import { ItemPageSmallScreen } from "./layouts/ItemPageSmallScreen.js";
import { ItemModalWindow } from "./modal/ItemModalWindow.js";
import { validateItemData } from "./utils/Utils.js";
import { useItemDetails } from "./hooks/useItemDetails.js";
import { useWhatsappLink } from "./hooks/useWhatsappLink.js";
import { useHeightGreaterThanWidth } from "Components/hooks/useHeightGreaterThanWidth.js";
import { isValidPostId } from "Components/utils/isValidPostId.js";

import "Styles/MainPages/CatalogItemPage/CatalogItemPage.scss";
import "Styles/CenteredText.scss";

export const CatalogItemPage = () => {
	const { itemId } = useParams();
	const [modalImageUrl, setModalImageUrl] = useState(null);
	const tallNarrowViewport = useHeightGreaterThanWidth();
	const { data, isPending, isPaused, error } = useItemDetails(itemId);
	const { data: whatsappData } = useWhatsappLink(itemId);
	const whatsappLink = whatsappData?.data?.url ?? null;

	// Несуществующий id и id, которого больше нет в каталоге, для посетителя
	// означают одно: такого товара нет. Проверка id стоит до гейта загрузки,
	// потому что ответ на неё известен без запроса: без сети ошибки, по
	// которой виден 404, ждать неоткуда, и мусорный id залипнет на «No
	// connection».
	if (!isValidPostId(itemId) || error?.status === 404) {
		return <p className="centered-text">Item not found</p>;
	}

	// Гейт на отсутствие данных: ниже data читается напрямую. Пауза без сети
	// попадает сюда же — она не даёт ни данных, ни ошибки, status остаётся
	// pending, поэтому отличить её от загрузки можно только по isPaused.
	if (isPending) {
		return (
			<p className="centered-text">
				{isPaused ? "No connection" : "Loading..."}
			</p>
		);
	}

	// Сообщение о сбое занимает страницу, только когда показывать больше
	// нечего: упавшее обновление оставляет данные прошлого успеха, и они
	// посетителю полезнее сообщения об ошибке.
	if (error && !data) {
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
