import "Styles/Window/ButtonLayer.scss";

/**
 * Компонент слоя навигационных кнопок страницы.
 *
 * @param {string} className - Имя класса для стилей.
 * @param {React.ReactNode} children - Компоненты, которые будут отображены внутри слоя (предполагается, что это кнопки).
 */
export const ButtonLayer = ({className, children}) => {
    return (
        <div className={className}>
            {children}
        </div>
    )
}
