/**
 * Строка добавления элемента справочника.
 *
 * @param {object} props
 * @param {string} props.value - Введённое название.
 * @param {(event: import("react").ChangeEvent<HTMLInputElement>) => void} props.onChange -
 *   Ввод в поле названия.
 * @param {() => void} props.onSubmit - Добавить: кнопка Add или Enter в поле.
 * @param {string} props.placeholder - Подсказка в пустом поле.
 * @param {boolean} props.isPending - Идёт запрос секции: поле и кнопка
 *   заблокированы, на кнопке «…».
 * @param {boolean} [props.canSubmit] - Можно ли добавлять; по умолчанию —
 *   введено непустое название. Секция с обязательной привязкой к другому
 *   справочнику требует ещё хотя бы один связанный элемент.
 * @param {import("react").ReactNode} [props.children] - Дополнительные поля под
 *   строкой (чекбоксы связанного справочника).
 */
export const SettingsAddRow = ({
	value,
	onChange,
	onSubmit,
	placeholder,
	isPending,
	canSubmit = value.trim() !== "",
	children,
}) => (
	<>
		<div className="settings-params__add-row">
			<input
				type="text"
				className="settings-params__add-input"
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				disabled={isPending}
				onKeyDown={(e) => {
					if (e.key === "Enter" && canSubmit) onSubmit();
				}}
			/>
			<button
				type="button"
				className="settings-params__add-button"
				onClick={onSubmit}
				disabled={isPending || !canSubmit}
			>
				{isPending ? "…" : "Add"}
			</button>
		</div>
		{children}
	</>
);
