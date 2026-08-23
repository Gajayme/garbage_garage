import React, { useEffect, useState } from "react";

import { Items } from "Components/MainPages/CatalogPage/Items/Items.js";
import { FiltersWindow } from "./Filters/FiltresWindow";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { FilterActivationButton } from "./FilterActivationButton";
import { FilterResetButton } from "./FilterResetButton";
import { isAnyFilterActive } from "./Filters/FilterActivity";
import { useUrlFilters } from "./useUrlFilters";
import { useCatalogItems } from "./useCatalogItems";
import { useCatalogScrollRestoration } from "./useCatalogScrollRestoration";

import "Styles/MainPages/CatalogPage/CatalogPage.scss";
import "Styles/MainPages/CatalogPage/Items/CatalogItems.scss";
import "Styles/MainPages/CatalogPage/FilterActivationButtons.scss";
import "Styles/MainPages/CatalogPage/FiltersItemsWrapper.scss";
import "Styles/CenteredText.scss";

export const CatalogPage = () => {
	// какие фильтры вообще существуют (приходят с бэка)
	const [allFilters, setAllFilters] = useState([]);
	// окно фильтров открыто/закрыто
	const [isFiltersVisible, setIsFiltersVisible] = useState(false);

	// хук, который занимается URL ↔ filtersState
	const { filtersState, setFilter, resetFilters, initialized } = useUrlFilters(allFilters);

	const { data, error, isLoading, isPlaceholderData } = useCatalogItems(filtersState);

	useCatalogScrollRestoration({
		ready: initialized && !error && !isLoading,
	});

	// один раз берём filters с бэка и сохраняем в allFilters
	useEffect(() => {
		if (data?.filters && allFilters.length === 0) {
			setAllFilters(data.filters);
		}
	}, [data, allFilters.length]);

	// Пока состав фильтров не пришёл, показывать каркас не из чего: кнопка Filters
	// открыла бы пустое окно. Ошибка попадает сюда только на самом первом запросе —
	// после успешного ответа initialized уже true, и ошибка рисуется внутри списка.
	if (!initialized) {
		return (
			<p className="centered-text">{error ? "Error happened" : "Loading..."}</p>
		);
	}

	const items = data?.data ?? [];
	const hasActiveFilters = isAnyFilterActive(allFilters, filtersState);
	return (
		<div className="catalog-page">
			<div className="catalog-page-content">
				<div className="filter-buttons-wrapper">
					<FilterActivationButton
						onClick={() => setIsFiltersVisible((prev) => !prev)}
						isActive={isFiltersVisible}
					/>
					{hasActiveFilters && <FilterResetButton onClick={resetFilters} />}
				</div>

				<div className="filters-items-wrapper">
					{error ? (
						/* Запрос по новому фильтру упал: списка нет, но кнопки фильтров
						   выше остались — иначе сломавший фильтр нечем сбросить.
						   Плейсхолдер тут не спасает: на ошибке react-query его
						   отбрасывает вместе со старым списком. */
						<p className="centered-text">Error happened</p>
					) : (
						/* Смена фильтра: старый список становится полупрозрачным */
						<div
							className={isPlaceholderData ? "catalog-items-pane--pending" : undefined}
							aria-busy={isPlaceholderData}
						>
							<Items catalogState={items} />
						</div>
					)}

					{/* окно фильтров — поверх грида, его верхний-левый угол
					    совпадает с верхним-левым углом первого изображения */}
					{isFiltersVisible && (
						<div className="filters-overlay">
							<FiltersWindow
								availableFilters={allFilters}
								filtersState={filtersState}
								onFilterStateChanged={(name) => (value) => setFilter(name, value)}
							/>
						</div>
					)}
				</div>
			</div>

			{isFiltersVisible && (
				<div
					className="filters-backdrop"
					onClick={() => setIsFiltersVisible(false)}
					aria-hidden="true"
				/>
			)}

			<ScrollToTopButton />
		</div>
	);
};
