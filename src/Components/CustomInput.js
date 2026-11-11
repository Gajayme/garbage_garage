/**
 * Кастомный инпут с опциональным валидатором.
 *
 * Props:
 * @param {string} value - Текущее значение поля ввода.
 * @param {Function} onChange - Обработчик изменения значения.
 * @param {string} id - id для input.
 * @param {string} className - Классы для input.
 * @param {number} maxLength - Максимальная длина текста.
 * @param {Function|null} inputValidator - Кастомный валидатор (event) => boolean.
 * @param {string} type - Тип поля (по умолчанию text).
 * @param {string} placeholder - Подсказка внутри поля.
 * @param {string} [name] - Имя поля для формы.
 * @param {string} [autoComplete] - Подсказка автозаполнения браузера.
 */
export const CustomInput = ({
	value,
	onChange = () => {},
	id = null,
	className = '',
	maxLength = 0,
	inputValidator = null,
	type = 'text',
	placeholder = '',
	name,
	autoComplete
}) => {

	const handleInput = (event) => {
		if (!inputValidator || inputValidator(event)) {
			onChange(event);
		}
	};

	return (
		<input
			type={type}
			id={id}
			name={name}
			autoComplete={autoComplete}
			className={className}
			value={value}
			maxLength={maxLength || undefined}
			placeholder={placeholder}
			onChange={handleInput}
		/>
	);
};
