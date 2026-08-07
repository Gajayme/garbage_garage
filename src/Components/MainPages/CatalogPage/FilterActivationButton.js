import { DefaultButton } from "Components/Button.js";

/**
 * Кнопка «FILTERS», открывающая/закрывающая окно фильтров.
 *
 * @param {Function} onClick - Функция для обработки клика по кнопке.
 */
export const FilterActivationButton = ({ onClick }) => {
	return (
		<DefaultButton
			className="filter-activation-button"
			labelText="FILTERS"
			onClick={onClick}
		/>
	);
};
