
import { Checkbox } from "Components/Checkbox";

import 'Styles/MainPages/CatalogPage/Filters/SpecificFilters/FilterCheckbox.scss'
import 'Styles/MainPages/CatalogPage/Filters/SpecificFilters/CheckboxMultiFilter.scss'


// активен, если выбран хотя бы один чекбокс
export const isCheckboxMultiFilterActive = (value) =>
	Array.isArray(value) && value.length > 0;

// фильтр с чекбоксами с доступным мультивыбором
export const CheckboxMultiFilter = ({ allValues, checkedOptions, onChange, checkmarkImg}) => {


	const handleOnChange = (newVal) => {
		const updatedOptions = checkedOptions.includes(newVal)
			? checkedOptions.filter(item => item !== newVal) // удалить выбок
			: [...checkedOptions, newVal];  // добавить

		onChange(updatedOptions)
	}

	return (
		<div className="checkbox-multifilter">
			{Object.entries(allValues).map(([id, name]) => (
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
