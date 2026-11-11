import "Styles/Window/OuterWindow.scss";

/**
 * Компонент внешней (фоновой) части базового окна страницы.
 *
 * @param {string} className - Имя класса для стилей.
 * @param {React.ReactNode} header - Компонент с заголовком окна.
 * @param {React.ReactNode} buttonLayer - Компонент с управляющими кнопками внутри окна.
 * @param {React.ReactNode} innerWindow - Компонент внутренней части окна.
 */
export const OuterWindow = ({className, header, buttonLayer, innerWindow}) => {
    return (
        <div className={className}>
            {header && <div className="header-part">{header}</div>}
            {buttonLayer && <div className="button-layer-part">{buttonLayer}</div>}
            {innerWindow && <div className="inner-window-part">{innerWindow}</div>}
        </div>
    )
}
