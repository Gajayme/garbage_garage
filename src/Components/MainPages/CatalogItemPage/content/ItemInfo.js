import "Styles/MainPages/CatalogItemPage/ItemInfo.scss";

/**
 * Компонент с данными о вещи (размер, цена) — без заголовка и описания.
 *
 * @param {string|number} size - размер
 * @param {string|number} price - цена
 * @param {string} [delimiter] - разделитель «ключ — значение»
 * @param {string} [className] - дополнительный класс-обёртка
 */
export const ItemInfo = ({ size, price, delimiter = ": ", className }) => {
	return (
		<div className={`item-info${className ? ` ${className}` : ""}`}>

			{/* Размер */}
			<p className="item-info__row">
				size{delimiter}{String(size)}
			</p>

			{/* Цена */}
			<p className="item-info__row">
				price{delimiter}{String(price)}
			</p>
		</div>
	);
};
