import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/** @type {Map<string, number>} */
const savedScrollByKey = new Map();

const getScrollContainer = () =>
	document.querySelector(".inner-window.no-overscroll");

/**
 * Сохраняет scrollTop `.inner-window` и восстанавливает его при возврате,
 * когда список товаров уже отрисован (`ready`).
 *
 * Обработчик scroll навешиваем только после готовности контента — так мы
 * физически не можем сохранить позицию до восстановления (иначе затёрли бы
 * сохранение нулём от свежесмонтированной страницы).
 *
 * Ключ — location.key (уникальный id записи истории от React Router), а не
 * pathname+search: у каждой записи истории своя позиция. Переход по ссылке
 * (NavLink) — это PUSH с новым key, поэтому скролл не восстанавливается; а
 * кнопка «назад» возвращает к прежней записи с тем же key — и позиция вернётся.
 *
 * @param {{ ready: boolean }} params
 * @param {boolean} params.ready — контент готов к восстановлению скролла
 */
export const useCatalogScrollRestoration = ({ ready }) => {
	const location = useLocation();
	const scrollKey = location.key;
	const restoredKeyRef = useRef(null);

	useLayoutEffect(() => {
		const container = ready ? getScrollContainer() : null;
		if (!container) {
			return undefined;
		}

		const cleanups = [];

		// Непрерывно запоминаем позицию, пока каталог готов и смонтирован.
		const save = () => savedScrollByKey.set(scrollKey, container.scrollTop);
		container.addEventListener("scroll", save, { passive: true });
		cleanups.push(() => container.removeEventListener("scroll", save));

		// Восстанавливаем позицию один раз на ключ.
		if (restoredKeyRef.current !== scrollKey) {
			restoredKeyRef.current = scrollKey;
			const saved = savedScrollByKey.get(scrollKey);

			if (saved != null) {
				const apply = () => {
					container.scrollTop = saved;
				};
				apply();

				// Карточки без фиксированной высоты картинок: после load высота
				// растёт — повторяем восстановление, иначе браузер зажимает scrollTop.
				const rafId = requestAnimationFrame(() => {
					apply();
					requestAnimationFrame(apply);
				});
				cleanups.push(() => cancelAnimationFrame(rafId));

				container.querySelectorAll("img").forEach((img) => {
					if (img.complete) {
						return;
					}
					img.addEventListener("load", apply);
					cleanups.push(() => img.removeEventListener("load", apply));
				});
			}
		}

		return () => cleanups.forEach((fn) => fn());
	}, [ready, scrollKey]);
};
