import { forwardRef } from "react";

/**
 * Компонент внутренней части базового окна страницы.
 *
 * @param {string} className - Имя класса для стилей.
 * @param {React.ReactNode} children - Компоненты, которые будут отображены во внутренней части окна.
 * @param {React.Ref<HTMLDivElement>} ref - Ссылка на корневой DOM-элемент (например, для доступа к скроллу).
 */
export const InnerWindow = forwardRef(({ className, children }, ref) => {
	return (
		<div className={className} ref={ref}>
			{children}
		</div>
	)
});

InnerWindow.displayName = "InnerWindow";
