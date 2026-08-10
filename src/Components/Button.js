
/**
 * Компонент кнопки.
 *
 * @param {string} className - Имя класса для стилей.
 * @param {string} labelText - Заголовок кнопки.
 * @param {"button" | "submit" | "reset"} type - Тип кнопки.
 * @param {Function} onClick - Функция для обработки клика по кнопке.
 * @param {boolean} disabled - Флаг, определяющий, является ли кнопка неактивной.
 * @param {string} iconSrc - src декоративной иконки слева от заголовка.
 * @param {string} iconClassName - Имя класса для стилей иконки.
 */
export const DefaultButton = ({className, labelText, type = "button", onClick, disabled, iconSrc, iconClassName}) => {
	return (
		<button className={className} onClick={onClick} type={type} disabled={disabled}>
			{iconSrc && <img className={iconClassName} src={iconSrc} alt="" aria-hidden={true} />}
			{labelText}
		</button>
	)
}
