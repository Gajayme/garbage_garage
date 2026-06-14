
import { BorderedImage } from "Components/BorderedImage.js"

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

	const brand = value.brand;
	const model = value.model ? value.model : "";
	const type = value.type;

	const name = brand + " " + model + " " + type;
	const size = "size: " + value.size;
	const price = "price: " + value.price;

	return (
		<div className={"catalog-item"} onClick={onClick}>
			<BorderedImage
				className="catalog-item-image"
				imageSrc = {imageSrc}
				alt={"item"}
			/>

			<p title={name}> {name}</p>
			<p title={size}> {size}</p>
			<p style={{ color: "red" }} title={price}> {price}</p>
		</div>
	)
}
