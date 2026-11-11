import { useEffect, useState } from "react";

import { useItemDetailsPrivate } from "Components/hooks/useItemDetailsPrivate.js";
import {
	mapItemDetailFields,
	mapDetailImagesToFormImages,
} from "Components/MainPages/UploadPage/mapItemDetailToFormState.js";

/**
 * Гидрирует поля и ошибки формы UploadPage данными вещи `editItemId`.
 *
 * - В create-режиме (editItemId пуст) ничего не делает и забывает, какой вещью
 *   форма заполнена и чем кончилась прошлая попытка заполнения, чтобы повторный
 *   заход в edit на тот же id снова сработал.
 * - В edit-режиме ждёт справочники (`paramsLoading`) и детали вещи, скачивает
 *   её фото и один раз заполняет форму.
 * - Защищён от race condition при быстрой смене `editItemId` через флаг `cancelled`.
 *
 * Контракт:
 *  - `editItemId` уже валиден (мусор отсеян на уровне UploadPage);
 *  - `setFormState` / `setErrorState` — стабильные сеттеры из useState;
 *  - `initialErrors` — стабильная ссылка (module-scope константа) на «пустые» ошибки.
 *
 * @returns {{ isHydrating: boolean, error: (Error & {status?: number})|null }}
 *   `isHydrating` — в edit-режиме true, пока форма не заполнена данными этой
 *   вещи: и пока идёт запрос, и пока качаются фото. `error` — провал запроса
 *   (со `.status === 404`, если вещи с таким id нет) или сбой заполнения:
 *   не скачалось фото, не разобрались поля. Ошибка приходит только когда
 *   показывать нечего, поэтому вместо формы в этом случае показывается экран ошибки.
 */
export const useHydrateUploadForm = ({
	editItemId,
	paramsLoading,
	setFormState,
	setErrorState,
	initialErrors,
}) => {
	// refetchOnMount: "always" — чтобы перед гидрацией форма запросила свежие данные.
	const {
		data: detailData,
		isFetching: detailFetching,
		error,
	} = useItemDetailsPrivate(editItemId ?? "", { refetchOnMount: "always" });

	// Id вещи, данными которой форма уже заполнена. По нему решается, показывать
	// ли форму, поэтому он хранится в state: запись должна перерисовать компонент.
	// Он же — сторож от повторной гидрации: рефетч деталей (например, по возврату
	// на вкладку) форму не перезаписывает, и несохранённые правки не теряются.
	// Сбрасывается в null при уходе в create-режим, чтобы возврат на тот же
	// id (edit '42' → create → edit '42') снова прошёл гидрацию.
	const [hydratedFor, setHydratedFor] = useState(null);

	// Сбой заполнения: не скачалось фото или не разобрались поля. Хранится
	// вместе с id вещи, чтобы сбой одной вещи не показывался вместо другой.
	const [hydrateError, setHydrateError] = useState(null);

	useEffect(() => {
		if (!editItemId) {
			setHydratedFor(null);
			setHydrateError(null);
			return;
		}
		if (paramsLoading || detailFetching || !detailData?.data) return;
		if (hydratedFor === editItemId) return;

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
				setHydrateError(null);
				setHydratedFor(editItemId);
			} catch (e) {
				// Сбой отменённой попытки показывать незачем: она уже не актуальна.
				if (cancelled) return;
				console.error("hydrate form failed:", e);
				setHydrateError({ id: editItemId, error: e });
			}
		})();
		// Cleanup effect: если editItemId сменился, пока шла гидрация, отменяем её.
		return () => {
			cancelled = true;
		};
	}, [
		editItemId,
		paramsLoading,
		detailFetching,
		detailData,
		hydratedFor,
		setFormState,
		setErrorState,
		initialErrors,
	]);

	// Провал отдаётся наружу как error, и пока он есть, isHydrating — false:
	// форма показывает экран ошибки, а не бесконечный «Loading...».
	//
	// Провал запроса — только пока показывать нечего: упавшее обновление при уже
	// загруженной вещи форму не касается — иначе рефетч по возврату на вкладку
	// стёр бы правки, которые админ успел внести и не сохранил.
	//
	// isHydrating зависит только от того, заполнена ли форма: рефетчи после
	// заполнения идут фоном, форма остаётся на экране и не теряет фокус.
	const fillError = hydrateError?.id === editItemId ? hydrateError.error : null;
	const failure = fillError ?? (detailData ? null : error);
	return {
		isHydrating: Boolean(editItemId) && hydratedFor !== editItemId && !failure,
		error: failure,
	};
};
