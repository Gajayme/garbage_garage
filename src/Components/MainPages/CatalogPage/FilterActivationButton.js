import { DefaultButton } from "Components/Button.js";

/**
 * Кнопка «FILTERS», открывающая/закрывающая окно фильтров.
 *
 * @param {Function} onClick - Функция для обработки клика по кнопке.
 * @param {boolean} isActive - Флаг, определяющий, открыто ли окно фильтров.
 */
export const FilterActivationButton = ({ onClick, isActive = false }) => {
	return (
		<DefaultButton
			className={isActive
				? "filter-activation-button filter-activation-button--selected"
				: "filter-activation-button"}
			labelText="filters"
			onClick={onClick}
		/>
	);
};
