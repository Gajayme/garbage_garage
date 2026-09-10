
import React, {useState} from 'react';

import {OuterWindow} from "Components/Window/OuterWindow.js"
import {InnerWindow} from "Components/Window/InnerWindow.js"

import 'Styles/Filters/FilterButton.scss'
import 'Styles/Filters/FilterWithButton.scss'
import 'Styles/Window/OuterWindow.scss'
import 'Styles/Window/InnerWindow.scss'


import { FilterBuilder } from './FiltersBuilder.js';


// Компонет со всеми фильтрами
export const FiltersWindow = ({availableFilters, filtersState, onFilterStateChanged}) => {

	// начальный стейт активности фильтров
	const initialFiltersActivityState =
	availableFilters.reduce((acc, filterData) => {
		acc[filterData.name] = false;
		return acc;
	}, {});

	// стейт активности фильтров
	const [filtersActivityState, setfiltersActivityState] = useState(initialFiltersActivityState);

	// переключение активности фильтров
	const toggleFilterButton = (filterName) => {
		setfiltersActivityState(prev => ({
			...prev,
			[filterName]: !prev[filterName]
		}));
	};

	const innerWindow = <InnerWindow
			className="inner-window-filters">
		<FilterBuilder
			availableFilters={availableFilters}
			filtersState={filtersState}
			toggleFilterVisibility={toggleFilterButton}
			onFilterStateChanged={onFilterStateChanged}
			filtersVisibility={filtersActivityState}
		/>
		</InnerWindow>


	return (
		<OuterWindow
			className="outer-window-filters"
			innerWindow={innerWindow}>
		</OuterWindow>
	)
}
