import "Styles/MainPages/CatalogItemPage/ItemInfo.scss";
import { currency } from "Constants.js";

/**
 * Компонент с данными о вещи (размер, цена) — без заголовка и описания.
 *
 * @param {string|null} size - размер; null — у вещи его нет, строка размера не выводится
 * @param {string|number} price - цена
 * @param {string} [delimiter] - разделитель «ключ — значение»
 * @param {string} [className] - дополнительный класс-обёртка
 */
export const ItemInfo = ({ size, price, delimiter = ": ", className }) => {
	return (
		<div className={`item-info${className ? ` ${className}` : ""}`}>

			{/* Размер */}
			{size != null ? (
				<p className="item-info__row">
					size{delimiter}{size}
				</p>
			) : null}

			{/* Цена */}
			<p className="item-info__row">
				price{delimiter}{String(price)} {currency}
			</p>
		</div>
	);
};
