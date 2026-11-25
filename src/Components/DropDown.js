
/**
 * Компонент выпадающего списка.
 *
 * @param {object} props
 * @param {string|number|null} props.value - Текущее выбранное значение;
 *   null — пустой вариант.
 * @param {Array<[string, string|number]>} props.options - Опции, доступные для выбора:
 *   пары [подпись, значение] в порядке показа (см. buildDropdownState.js).
 * @param {string} props.id - id выпадающего списка.
 * @param {(value: string|null) => void} props.onChange - Выбор новой опции:
 *   значение строкой (так его отдаёт <select>), у пустого варианта — null.
 * @param {string} props.className - Имя класса выпадающего списка.
 * @param {string} props.optionClassName - Имя класса опции внутри выпадающего списка.
 * @param {boolean} [props.disabled] - Заблокировать выбор.
 */
export const Dropdown = ({value, options, id, onChange, className, optionClassName, disabled}) => {
	return (
		<select className={className}
			// Защита от null
			value={value ?? ''}
			id={id}
			disabled={disabled}
			// Если пустая строка (дефолтное значение) то отправляем на валидацию null
			onChange={(e) => onChange(e.target.value || null)}>
			{options.map(([key, value], index) => (
				<option
					className={optionClassName}
					key={index}
					value={value}
					label={key}>
					{key}
					</option>
			))}
		</select>
	);
};
