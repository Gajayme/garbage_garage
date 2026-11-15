import { useLayoutEffect, useState } from "react";

/**
 * blob-URL для показа `file`, который живёт ровно столько, сколько вызвавший
 * компонент: создаётся при монтировании, освобождается при размонтировании
 * или смене файла. Пока файла нет (`null`/`undefined`), возвращает `null`.
 *
 * URL создаётся в эффекте, а не при рендере и не в `useMemo`: тогда создание
 * и освобождение — setup и cleanup одного эффекта, и React всегда вызывает их
 * парами. Рендер должен быть без побочных эффектов: React вправе вызвать его
 * лишний раз или выбросить результат, не применив к DOM, и URL, созданный
 * в таком рендере, никто не освободит. `useMemo` от этого не спасает, а под
 * StrictMode ещё и ломает показ: в dev-режиме React прогоняет эффекты как
 * setup → cleanup → setup без нового рендера, и компонент показывал бы URL
 * из `useMemo`, уже освобождённый в cleanup.
 *
 * `useLayoutEffect` — потому что в первом рендере URL ещё нет: обновление
 * state из него React обрабатывает до отрисовки, и кадр без картинки
 * пользователь не видит.
 *
 * @param {File|Blob|null|undefined} file
 * @returns {string|null}
 */
export const useObjectUrl = (file) => {
	const [url, setUrl] = useState(null);

	useLayoutEffect(() => {
		if (!file) return;
		const created = URL.createObjectURL(file);
		setUrl(created);
		return () => {
			URL.revokeObjectURL(created);
			setUrl(null);
		};
	}, [file]);

	return url;
};
