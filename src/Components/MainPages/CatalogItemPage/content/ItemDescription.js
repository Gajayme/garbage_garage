import "Styles/MainPages/CatalogItemPage/ItemDescriptionCatalog.scss";

/**
 * Компонент с текстом описания вещи.
 *
 * @param {string} description - текст описания
 * @param {string} [className] - дополнительный класс-обёртка
 */
export const ItemDescription = ({ description, className }) => {
	if (description == null || description === "") return null;

	return (
		<div className={`item-description-catalog ${className ? ` ${className}` : ""}`}>
			<p>{String(description)}</p>
		</div>
	);
};
