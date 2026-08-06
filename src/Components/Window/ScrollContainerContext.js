import { createContext, useContext } from "react";

/**
 * Контекст со ссылкой (ref) на прокручиваемый контейнер страницы.
 *
 * Позволяет вложенным компонентам (кнопка «наверх», восстановление скролла)
 * получить сам DOM-элемент контейнера напрямую.
 *
 * Значение по умолчанию — `null`: оно означает «провайдер отсутствует» и
 * позволяет хуку `useScrollContainerRef` упасть с понятной ошибкой.
 *
 * @type {React.Context<React.MutableRefObject<HTMLElement | null> | null>}
 */
export const ScrollContainerContext = createContext(null);

/**
 * Возвращает ref на прокручиваемый контейнер страницы.
 *
 * Бросает ошибку, если используется вне `ScrollContainerContext.Provider`.
 *
 * @returns {React.MutableRefObject<HTMLElement | null>}
 */
export const useScrollContainerRef = () => {
	const scrollContainerRef = useContext(ScrollContainerContext);
	if (scrollContainerRef === null) {
		throw new Error(
			"useScrollContainerRef must be used within a <ScrollContainerContext.Provider>"
		);
	}
	return scrollContainerRef;
};
