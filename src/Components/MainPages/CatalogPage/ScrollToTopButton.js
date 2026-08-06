import { useEffect, useState } from "react";

import { DefaultButton } from "Components/Button.js";
import { useScrollContainerRef } from "Components/Window/ScrollContainerContext.js";

import "Styles/MainPages/CatalogPage/ScrollToTopButton.scss";

/**
 * Кнопка «UP», всплывающая над списком вещей в нижней части.
 *
 * Появляется, как только контейнер списка проскроллен хоть немного вниз,
 * и по клику мгновенно возвращает скролл в начало.
 */
export const ScrollToTopButton = () => {
	const scrollContainerRef = useScrollContainerRef();
	const [isVisible, setIsVisible] = useState(false);

	const pixelsToAppear = 300;

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) {
			return undefined;
		}

		const update = () => setIsVisible(container.scrollTop > pixelsToAppear);
		update();

		container.addEventListener("scroll", update, { passive: true });
		return () => container.removeEventListener("scroll", update);
	}, [scrollContainerRef]);

	if (!isVisible) {
		return null;
	}

	const scrollToTop = () => {
		const container = scrollContainerRef.current;
		if (container) {
			container.scrollTop = 0;
		}
	};

	return (
		<DefaultButton
			className="scroll-to-top-button"
			labelText="up"
			onClick={scrollToTop}
		/>
	);
};
