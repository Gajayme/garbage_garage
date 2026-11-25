import { useMemo } from "react";

import { compareByTitle } from "Components/utils/labelCollator.js";

import "Styles/MainPages/SettingsPage/SettingsLinkPicker.scss";

/** @typedef {import("Components/MainPages/SettingsPage/dictionaryLink.js").DictionaryLink} DictionaryLink */

/**
 * Чекбоксы элементов связанного справочника: к каким из них привязан элемент.
 *
 * Нативные чекбоксы, а не Checkbox из фильтров: тот прячет input и
 * с клавиатуры недоступен, а остальная страница настроек — на нативных контролах.
 *
 * @param {object} props
 * @param {DictionaryLink} props.link - Связанный справочник и заголовок чекбоксов.
 * @param {number[]} props.selectedIds - Отмеченные id.
 * @param {(ids: number[]) => void} props.onChange - Вызывается при переключении
 *   чекбокса со всем новым списком отмеченных id, а не только с переключённым.
 * @param {boolean} [props.disabled] - Заблокировать чекбоксы: идёт запрос секции.
 * @param {string|null} [props.hint] - Подсказка под чекбоксами: почему кнопка
 *   добавления или сохранения заблокирована. null — подсказки нет.
 */
export const SettingsLinkPicker = ({ link, selectedIds, onChange, disabled, hint }) => {
	const { options, label } = link;
	const sortedOptions = useMemo(
		() => [...(options ?? [])].sort(compareByTitle),
		[options]
	);

	const toggle = (id) =>
		onChange(
			selectedIds.includes(id)
				? selectedIds.filter((selectedId) => selectedId !== id)
				: [...selectedIds, id]
		);

	return (
		<fieldset className="settings-link-picker" disabled={disabled}>
			<legend className="settings-link-picker__legend">{label}</legend>
			{sortedOptions.map((option) => (
				<label key={option.id} className="settings-link-picker__option">
					<input
						type="checkbox"
						checked={selectedIds.includes(option.id)}
						onChange={() => toggle(option.id)}
					/>
					{option.title}
				</label>
			))}
			{hint ? (
				<p className="settings-link-picker__hint" role="alert">
					{hint}
				</p>
			) : null}
		</fieldset>
	);
};
