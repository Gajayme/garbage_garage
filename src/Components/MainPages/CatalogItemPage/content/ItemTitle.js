import "Styles/MainPages/CatalogItemPage/ItemTitle.scss";

/**
 * Заголовок страницы вещи (имя вещи).
 *
 * @param {string} title - имя вещи
 * @param {string} [className] - дополнительный класс-обёртка
 */
export const ItemTitle = ({ title, className }) => {
	return (
		<p className={`item-title${className ? ` ${className}` : ""}`}>
			{title}
		</p>
	);
};
