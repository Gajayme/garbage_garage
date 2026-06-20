import { useEffect, useState } from "react";

/**
 * Отслеживает, является ли окно браузера «высоким и узким»:
 * внутренняя высота viewport больше внутренней ширины (`innerHeight > innerWidth`).
 *
 * Используется для переключения вёрстки (например, портретный телефон vs альбомная
 * ориентация или широкое окно на десктопе): значение обновляется при изменении
 * размеров окна (`resize`).
 *
 * @returns {boolean} `true`, если высота viewport больше ширины; иначе `false`.
 */
export const useHeightGreaterThanWidth = () => {
	const [value, setValue] = useState(() =>
		typeof window !== "undefined" && window.innerHeight > window.innerWidth,
	);

	useEffect(() => {
		const update = () =>
			setValue(window.innerHeight > window.innerWidth);
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, []);

	return value;
};
