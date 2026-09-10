import * as Constants from "./Constants";
import { isCheckboxMultiFilterActive } from "./SpecificFilters/CheckboxMultiFilter";
import { isRangeFilterActive } from "./SpecificFilters/RangeFilter";

// реестр проверок активности по типу фильтра
const activityCheckers = {
	[Constants.FilterType.multiCheckbox]: isCheckboxMultiFilterActive,
	[Constants.FilterType.range]: isRangeFilterActive,
};

// активен ли конкретный фильтр
export const isFilterActive = (filterDefinition, filtersState) => {
	const checker = activityCheckers[filterDefinition.type];
	return checker ? checker(filtersState[filterDefinition.name]) : false;
};

// активен ли хотя бы один фильтр
export const isAnyFilterActive = (availableFilters, filtersState) =>
	availableFilters.some((f) => isFilterActive(f, filtersState));
