import { ItemImageGallery } from "../images/ItemImageGallery.js";
import { ItemTitle } from "../content/ItemTitle.js";
import { ItemInfo } from "../content/ItemInfo.js";
import { ItemDescription } from "../content/ItemDescription.js";
import { BuyItemButton } from "../content/BuyItemButton.js";
import { getItemData } from "../utils/Utils.js";

import "Styles/MainPages/CatalogItemPage/ItemPageSmallScreen.scss";

/**
 * Раскладка страницы вещи для узких/высоких экранов.
 *
 * Сверху — данные о вещи, под ними галерея изображений, ниже — описание.
 *
 * @param {{ title: string, size: any, price: any, description: string }} itemData
 * @param {Array} images - массив изображений вещи
 * @param {Function} onImageClick - обработчик клика по изображению (открытие модалки)
 * @param {string|null} whatsappLink - ссылка на WhatsApp для кнопки BUY
 */
export const ItemPageSmallScreen = ({ itemData, onImageClick, whatsappLink }) => {

	const { title, size, price, description, images } = getItemData(itemData);

	return (
		<div className="item-page-small-screen">
			<ItemTitle className="item-page-small-screen__title" title={title} />
			<ItemInfo className="item-page-small-screen__info" size={size} price={price} />
			<ItemImageGallery className="item-page-small-screen__image-gallery" images={images} onImageClick={onImageClick} />
			<ItemDescription className="item-page-small-screen__description" description={description} />
			<BuyItemButton className="item-page-small-screen__button" whatsappLink={whatsappLink} />
		</div>
	);
};
