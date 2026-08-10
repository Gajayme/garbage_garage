import { DefaultButton } from "Components/Button.js";

import resetFilters from "Assets/Icons/Filters/reset_filters.svg";

/**
 * Кнопка «RESET», сбрасывающая выбранные фильтры.
 *
 * @param {Function} onClick - Функция для обработки клика по кнопке.
 */
export const FilterResetButton = ({ onClick }) => {
	return (
		<DefaultButton
			className="filter-reset-button"
			labelText="reset"
			onClick={onClick}
			iconSrc={resetFilters}
			iconClassName="filter-button-icon"
		/>
	);
};
