import { ItemImageGrid } from "../images/ItemImageGrid.js";
import { ItemTitle } from "../content/ItemTitle.js";
import { ItemInfo } from "../content/ItemInfo.js";
import { ItemDescription } from "../content/ItemDescription.js";
import { BuyItemButton } from "../content/BuyItemButton.js";
import { getItemData } from "../utils/Utils.js";

import "Styles/MainPages/CatalogItemPage/ItemPageBigScreen.scss";

/**
 * Раскладка страницы вещи для широких экранов.
 *
 * Слева — сетка изображений, справа — колонка с данными о вещи и описанием.
 *
 * @param {{ title: string, size: any, price: any, description: string }} itemData
 * @param {Array} images - массив изображений вещи
 * @param {Function} onImageClick - обработчик клика по изображению (открытие модалки)
 * @param {string|null} whatsappLink - ссылка на WhatsApp для кнопки BUY
 */
export const ItemPageBigScreen = ({ itemData, onImageClick, whatsappLink }) => {

	const { title, size, price, description, images } = getItemData(itemData);

	return (
		<div className="item-page-big-screen">
			<ItemImageGrid images={images} onImageClick={onImageClick} />

			<div className="item-page-big-screen__aside">
				<ItemTitle className="item-page-big-screen__title" title={title} />
				<ItemInfo className="item-page-big-screen__info" size={size} price={price} />
				<ItemDescription className="item-page-big-screen__description" description={description} />
				<BuyItemButton whatsappLink={whatsappLink} />
			</div>
		</div>
	);
};
