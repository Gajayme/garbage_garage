
import { useMemo } from "react";

import { Checkbox } from "Components/Checkbox";
import { compareLabels } from "Components/utils/labelCollator.js";

import 'Styles/Filters/SpecificFilters/FilterCheckbox.scss'
import 'Styles/Filters/SpecificFilters/CheckboxMultiFilter.scss'


// активен, если выбран хотя бы один чекбокс
export const isCheckboxMultiFilterActive = (value) =>
	Array.isArray(value) && value.length > 0;

/**
 * Фильтр с чекбоксами с доступным мультивыбором.
 *
 * @param {object} props
 * @param {(nameA: string, nameB: string) => number} [props.compareNames] - Сравнить
 *   подписи двух значений при сортировке списка: возвращает число, как компаратор
 *   Array.prototype.sort. По умолчанию — compareLabels, по алфавиту.
 */
export const CheckboxMultiFilter = ({ allValues, checkedOptions, onChange, checkmarkImg, compareNames = compareLabels }) => {

	const sortedValues = useMemo(
		() => Object.entries(allValues).sort(([, nameA], [, nameB]) => compareNames(nameA, nameB)),
		[allValues, compareNames]
	);

	const handleOnChange = (newVal) => {
		const updatedOptions = checkedOptions.includes(newVal)
			? checkedOptions.filter(item => item !== newVal) // удалить выбор
			: [...checkedOptions, newVal];  // добавить

		onChange(updatedOptions)
	}

	return (
		<div className="checkbox-multifilter">
			{sortedValues.map(([id, name]) => (
				<div key={id}>
					<Checkbox
						className = {'filter-checkbox'}
						isChecked={checkedOptions.includes(id)}
						name={name}
						value={id}
						checkmarkImg={checkmarkImg}
						onChange={handleOnChange}/>
				</div>
			))}
		</div>
	);
};
