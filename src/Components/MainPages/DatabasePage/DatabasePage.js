import { useEffect, useState } from "react";

import { usePrivateCatalogItems } from "Components/MainPages/DatabasePage/usePrivateCatalogItems.js";
import { DatabaseItems } from "Components/MainPages/DatabasePage/Items/DatabaseItems.js";
import { NavButton } from "Components/Navigation/NavButton";
import * as Nav from "Components/Navigation/paths.js";

import { FiltersWindow } from "Components/Filters/FiltersWindow";
import { FilterActivationButton } from "Components/Filters/FilterActivationButton";
import { FilterResetButton } from "Components/Filters/FilterResetButton";
import { isAnyFilterActive } from "Components/Filters/FilterActivity";
import { useUrlFilters } from "Components/Filters/useUrlFilters";
import { ScrollToTopButton } from "Components/ScrollToTopButton";
import { useListScrollRestoration } from "Components/hooks/useListScrollRestoration";

import "Styles/Navigation/NavButton.scss";
import "Styles/Filters/FilterActivationButtons.scss";
import "Styles/Filters/FiltersItemsWrapper.scss";
import "Styles/CenteredText.scss";
import "Styles/MainPages/DatabasePage/DatabasePage.scss";

export const DatabasePage = () => {
	// какие фильтры вообще существуют (приходят с бэка в data.filters,
	// как и в каталоге; у приватного списка есть ещё фильтр по статусу)
	const [allFilters, setAllFilters] = useState([]);
	// окно фильтров открыто/закрыто
	const [isFiltersVisible, setIsFiltersVisible] = useState(false);

	const { filtersState, setFilter, resetFilters, initialized } = useUrlFilters(allFilters);

	const { data, error, isLoading, isPlaceholderData } = usePrivateCatalogItems(filtersState);

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
		<div className="database-page">
			<div className="database-page-content">
				<div className="database-page-actions">
					<NavButton labelText="Add new" destination={`/${Nav.upload}`} />
				</div>

				<div className="filter-buttons-wrapper">
					<FilterActivationButton
						onClick={() => setIsFiltersVisible((prev) => !prev)}
						isActive={isFiltersVisible}
					/>
					{hasActiveFilters && <FilterResetButton onClick={resetFilters} />}
				</div>

				<div className="filters-items-wrapper">
					{error ? (
						/* Рефетч по новому фильтру упал: списка нет, но кнопки фильтров
						   выше остались — иначе сломавший фильтр нечем сбросить. */
						<p className="centered-text">Error happened</p>
					) : (
						/* Смена фильтра: старый список становится полупрозрачным */
						<div
							className={isPlaceholderData ? "list-items-pane--pending" : undefined}
							aria-busy={isPlaceholderData}
						>
							<DatabaseItems catalogState={items} />
						</div>
					)}

					{/* окно фильтров — оверлеем поверх грида */}
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
