/**
 * Кастомный textarea с опциональным валидатором.
 *
 * @param {string} value - Текущее значение поля.
 * @param {Function} onChange - Обработчик изменения значения.
 * @param {string} id - id для textarea.
 * @param {string} className - Классы для textarea.
 * @param {number} maxLength - Максимальная длина текста.
 * @param {Function|null} inputValidator - Кастомный валидатор (event) => boolean.
 * @param {string} placeholder - Подсказка внутри поля.
 * @param {number} rows - Число видимых строк.
 */
export const CustomTextArea = ({
	value,
	onChange = () => {},
	id = null,
	className = '',
	maxLength = 0,
	inputValidator = null,
	placeholder = '',
	rows = 4,
}) => {
	const handleInput = (event) => {
		if (!inputValidator || inputValidator(event)) {
			onChange(event);
		}
	};

	return (
		<textarea
			id={id}
			className={className}
			value={value}
			rows={rows}
			maxLength={maxLength || undefined}
			placeholder={placeholder}
			onChange={handleInput}
		/>
	);
};
