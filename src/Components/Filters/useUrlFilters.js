import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parseFiltersFromUrl, buildQueryString } from "./filterQueryString"
import * as FilterConstants from "./Constants";


// ------------------------------------------------------------
// ХУК useUrlFilters
// ------------------------------------------------------------
export const useUrlFilters = (filtersDefinition) => {
	const location = useLocation();
	const navigate = useNavigate();

	const [filtersState, setFiltersState] = useState({});
	const [initialized, setInitialized] = useState(false);

	// --------------------------------------------------------
	// 1. ИНИЦИАЛИЗАЦИЯ (ОДИН РАЗ)
	// --------------------------------------------------------
	useEffect(() => {
		if (initialized) return;
		if (!filtersDefinition?.length) return;

		const defaultState = {};
		filtersDefinition.forEach(f => {
			if (f.type === FilterConstants.FilterType.multiCheckbox) {
				defaultState[f.name] = [];
			}
			if (f.type === FilterConstants.FilterType.range) {
				defaultState[f.name] = { min: "", max: "" };
			}
		});

		const params = new URLSearchParams(location.search);
		const restored = parseFiltersFromUrl(params, filtersDefinition);

		setFiltersState({ ...defaultState, ...restored });
		setInitialized(true);
		// eslint-disable-next-line
	}, [filtersDefinition, initialized]);

	// --------------------------------------------------------
	// 2. STATE → URL (пользователь меняет фильтры)
	// --------------------------------------------------------
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		if (!initialized) return;

		const query = buildQueryString(filtersState);
		const current = location.search.replace(/^\?/, "");

		if (query === current) return;

		navigate(`?${query}`, { replace: false });
		// eslint-disable-next-line
	}, [filtersState, initialized, navigate]);

	// --------------------------------------------------------
	// 3. URL → STATE (Back / Forward)
	// --------------------------------------------------------
	useEffect(() => {
		if (!initialized) return;

		const params = new URLSearchParams(location.search);
		const fromUrl = parseFiltersFromUrl(params, filtersDefinition);

		const currentQuery = buildQueryString(filtersState);
		const urlQuery = params.toString();

		if (currentQuery === urlQuery) return;

		setFiltersState(prev => ({
			...prev,
			...fromUrl,
		}));
		// eslint-disable-next-line
	}, [location.search, initialized, filtersDefinition]);

	// --------------------------------------------------------
	// API
	// --------------------------------------------------------
	const setFilter = (name, value) => {
		setFiltersState(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const resetFilters = () => {
		if (!filtersDefinition?.length) return;
		const defaultState = {};
		filtersDefinition.forEach(f => {
			if (f.type === FilterConstants.FilterType.multiCheckbox) {
				defaultState[f.name] = [];
			}
			if (f.type === FilterConstants.FilterType.range) {
				defaultState[f.name] = { min: "", max: "" };
			}
		});
		setFiltersState(defaultState);
	};

	return {
		filtersState,
		setFilter,
		resetFilters,
		initialized,
	};
};
