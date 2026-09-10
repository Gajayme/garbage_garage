

import * as FilterConstants from "./Constants.js"


// ------------------------------------------------------------
// Генерация QueryString из filtersState
// ------------------------------------------------------------
export const buildQueryString = (filters) => {
	const params = new URLSearchParams();

	Object.entries(filters).forEach(([key, value]) => {
		// если массив → добавляем несколько параметров: &category=a&category=b

		if (Array.isArray(value)) {
			value.forEach(v => params.append(key, v));
		}

		// если объект → например range: {min: 10, max: 50} → min=10&max=50
		else if (typeof value === "object" && value !== null) {
			Object.entries(value).forEach(([subKey, subValue]) => {
				if (subValue !== "" && subValue !== null) {
					params.append(`${key}_${subKey}`, subValue);
				}
			});
		}

		// если обычное значение, то просто добавляем его
		else if (value !== "" && value !== null) {
			params.append(key, value);
		}
	});
	return params.toString(); // "category=food&category=drinks&min=10&max=50"
};

// ------------------------------------------------------------
// Парсим фильтры из URL → объект filtersState
// ------------------------------------------------------------
export const parseFiltersFromUrl = (searchParams, filterDefinitions) => {
	const state = {};

	filterDefinitions.forEach(filter => {
		const { name, type } = filter;

		// multichackbox фильтры
		if (type === FilterConstants.FilterType.multiCheckbox) {
			state[name] = searchParams.getAll(name) || [];
		}

		// range фильтр цены
		else if (type === FilterConstants.FilterType.range) {
			state[name] = {
				min: searchParams.get(`${name}_min`) || "",
				max: searchParams.get(`${name}_max`) || "",
			};
		}
	});

	return state;
};
