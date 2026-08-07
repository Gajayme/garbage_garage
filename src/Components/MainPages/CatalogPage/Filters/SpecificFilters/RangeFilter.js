import React from 'react';

import {NumbersOnly} from 'Components/utils/inputFilters.js'
import {CustomInput} from 'Components/CustomInput.js';
import {priceMaxLength} from './Constants.js'

import 'Styles/MainPages/CatalogPage/Filters/SpecificFilters/PriceRangeFilter.scss'


// активен, если введено значение хотя бы в одно из полей
export const isRangeFilterActive = (value) =>
	Boolean(value?.min) || Boolean(value?.max);

// фильтр с двумя окнами ввода минимального и максимального значений для фильтрации
export const RangeFilter = ({image, onChange, currentValues}) => {

	const handleMinChange = (newMin) => {
		const value = newMin.target.value;
		onChange({ ...currentValues, min: value });
	};

	const handleMaxChange = (newMax) => {
		const value = newMax.target.value;
		onChange({ ...currentValues, max: value });
	};


	return (
	<div className='price-range-container'>
		<CustomInput
			value={currentValues.min}
			className='price-input'
			type="text"
			placeholder="min"
			maxLength = {priceMaxLength}
			inputValidator={NumbersOnly}
			onChange={handleMinChange}
		/>

		<img
			className='price-icon '
			src={image}
			alt="to"
		/>

		<CustomInput
			className='price-input'
			type="text"
			placeholder="max"
			value={currentValues.max}
			maxLength = {priceMaxLength}
			inputValidator={NumbersOnly}
			onChange={handleMaxChange}
		/>
	</div>
	);
};
