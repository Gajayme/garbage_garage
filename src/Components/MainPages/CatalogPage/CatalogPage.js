import React, { useEffect, useState } from "react";

import { Items } from "Components/MainPages/CatalogPage/Items/Items.js";
import { FiltersWindow } from "Components/Filters/FiltersWindow";
import { ScrollToTopButton } from "Components/ScrollToTopButton";
import { FilterActivationButton } from "Components/Filters/FilterActivationButton";
import { FilterResetButton } from "Components/Filters/FilterResetButton";
import { isAnyFilterActive } from "Components/Filters/FilterActivity";
import { useUrlFilters } from "Components/Filters/useUrlFilters";
import { useCatalogItems } from "./useCatalogItems";
import { useListScrollRestoration } from "Components/hooks/useListScrollRestoration";

import "Styles/MainPages/CatalogPage/CatalogPage.scss";
import "Styles/MainPages/CatalogPage/Items/CatalogItems.scss";
import "Styles/Filters/FilterActivationButtons.scss";
import "Styles/Filters/FiltersItemsWrapper.scss";
import "Styles/CenteredText.scss";

export const CatalogPage = () => {
	// какие фильтры вообще существуют (приходят с бэка)
	const [allFilters, setAllFilters] = useState([]);
	// окно фильтров открыто/закрыто
	const [isFiltersVisible, setIsFiltersVisible] = useState(false);

	// хук, который занимается URL ↔ filtersState
	const { filtersState, setFilter, resetFilters, initialized } = useUrlFilters(allFilters);

	const { data, error, isLoading, isPlaceholderData } = useCatalogItems(filtersState);

	useListScrollRestoration({
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
							className={isPlaceholderData ? "list-items-pane--pending" : undefined}
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
