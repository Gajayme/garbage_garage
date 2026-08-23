import { useEffect, useRef } from "react";

import { useItemDetailsPrivate } from "Components/hooks/useItemDetailsPrivate.js";
import {
	mapItemDetailFields,
	mapDetailImagesToFormImages,
} from "Components/MainPages/UploadPage/mapItemDetailToFormState.js";

/**
 * Гидрирует поля и ошибки формы UploadPage данными вещи `editItemId`.
 *
 * - В create-режиме (editItemId пуст) ничего не делает и сбрасывает
 *   ref-«сторож», чтобы повторный заход в edit на тот же id снова сработал.
 * - В edit-режиме сначала ждёт, пока подгрузятся справочники (`paramsLoading`)
 *   и детали вещи (`detailFetching`), и затем один раз заполняет форму.
 * - Защищён от race condition при быстрой смене `editItemId` через флаг `cancelled`.
 *
 * Контракт:
 *  - `editItemId` уже валиден (мусор отсеян на уровне UploadPage);
 *  - `setFormState` / `setErrorState` — стабильные сеттеры из useState;
 *  - `initialErrors` — стабильная ссылка (module-scope константа) на «пустые» ошибки;
 *  - `onError` — стабильный (через `useCallback`) обработчик ошибок гидрации.
 *
 * @returns {{ isHydrating: boolean }} — true пока запрос деталей идёт.
 */
export const useHydrateUploadForm = ({
	editItemId,
	paramsLoading,
	setFormState,
	setErrorState,
	initialErrors,
	onError,
}) => {
	// refetchOnMount: "always" — чтобы перед гидрацией форма запросила свежие данные.
	const { data: detailData, isFetching: detailFetching } =
		useItemDetailsPrivate(editItemId ?? "", { refetchOnMount: "always" });

	// Сторож от повторной гидрации одного и того же id.
	// Хранит editItemId, для которого форма уже была заполнена. Сравниваем
	// его с текущим editItemId перед стартом эффекта: если совпало — выходим,
	// иначе гидрируем и записываем сюда новый id.
	// Сбрасывается в null при уходе в create-режим, чтобы возврат на тот же
	// id (edit '42' → create → edit '42') снова прошёл гидрацию.
	const hydratedForRef = useRef(null);

	useEffect(() => {
		if (!editItemId) {
			hydratedForRef.current = null;
			return;
		}
		if (paramsLoading || detailFetching || !detailData?.data) return;
		if (hydratedForRef.current === editItemId) return;

		// Флаг отмены для борьбы с race condition: если editItemId сменится,
		// пока идёт `await mapDetailImagesToFormImages(...)`, cleanup выставит
		// cancelled = true, и запоздавший результат не перезапишет уже
		// актуальное состояние формы.
		let cancelled = false;
		(async () => {
			try {
				const d = detailData.data;
				const fields = mapItemDetailFields(d);
				const images = await mapDetailImagesToFormImages(d.images);
				if (cancelled) return;
				setFormState((prev) => ({ ...prev, ...fields, images }));
				setErrorState(initialErrors);
				hydratedForRef.current = editItemId;
			} catch (e) {
				console.error("hydrate form failed:", e);
				onError?.();
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [
		editItemId,
		paramsLoading,
		detailFetching,
		detailData,
		setFormState,
		setErrorState,
		initialErrors,
		onError,
	]);

	return { isHydrating: detailFetching };
};
