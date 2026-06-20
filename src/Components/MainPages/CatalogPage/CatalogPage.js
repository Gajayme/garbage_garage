import React, { useEffect, useState } from "react";

import { Items } from "Components/MainPages/CatalogPage/Items/Items.js";
import { FiltersWindow } from "./Filters/FiltresWindow";
import { DefaultButton } from "Components/Button.js";
import { useUrlFilters } from "./useUrlFilters";
import { useCatalogItems } from "./useCatalogItems";

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

	const { data, error, isLoading } = useCatalogItems(filtersState);

	// один раз берём filters с бэка и сохраняем в allFilters
	useEffect(() => {
		if (data?.filters && allFilters.length === 0) {
			setAllFilters(data.filters);
		}
	}, [data, allFilters.length]);

	// пока фильтры ещё не инициализированы, отображаем загрузочный текст вместо всего контента
	if (!initialized) {
		return (
			<p className="centered-text">Loading...</p>
		);
	}
	// если произошла ошибка, отображаем текст ошибки
	else if (error) {
		return (
			<p className="centered-text">Error happened</p>
		);
	}

	const items = data?.data ?? [];
	return (
		<div className="catalog-page">
			<div className="catalog-page-content">
				<div className="filter-buttons-wrapper">
					<DefaultButton
						className="filter-activation-button"
						labelText="FILTERS"
						onClick={() => setIsFiltersVisible((prev) => !prev)}
					/>
					<DefaultButton
						className="filter-reset-button"
						labelText="RESET"
						onClick={resetFilters}
					/>
				</div>

				<div className="filters-items-wrapper">
					{/* пока запрос идёт, отображаем загрузочный текст (только вместо карточек товаров)*/}
					{isLoading ? (
						<p className="centered-text">Loading...</p>
					) : (
						<Items catalogState={items} />
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
		</div>
	);
};
