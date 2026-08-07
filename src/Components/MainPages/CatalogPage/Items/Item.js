
import { BorderedImage } from "Components/BorderedImage.js"
import { buildTitle } from "Components/utils/buildTitile";
import { currency } from "Constants.js";

import "Styles/MainPages/CatalogPage/Items/CatalogItem.scss"
import "Styles/TopAndLeftBorders.scss"


/**
 * Компонент для отображения одной вещи с краткой информацией по ней.
 *
 * @param {Object} value - Объект товара (itemName, price, images и т.д.).
 * @param {Function} onClick - Функция-обработчик клика на элемент.
 */
export const Item = ({ value, onClick }) => {
	const imageSrc = value.images?.[0]?.image_url ?? null;

	const brand = value.brand.title;
	const model = value.model;
	const type = value.type.title;

	const name = buildTitle(brand, model, type);
	const details = value.size + ", " + value.price + " " + currency;

	return (
		<div className="catalog-page-item" onClick={onClick}>
			<BorderedImage
				className="catalog-page-item-image"
				imageSrc = {imageSrc}
				alt={"item"}
			/>

			<div className="catalog-item-info">
				<p className="catalog-item-name"	title={name}>	{name}</p>
				<p className="catalog-item-details"	title={details}>	{details}</p>
			</div>

		</div>
	)
}
