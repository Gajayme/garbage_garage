import { SettingsLinkPicker } from "Components/MainPages/SettingsPage/SettingsLinkPicker.js";
import { linkedTitles } from "Components/MainPages/SettingsPage/dictionaryLink.js";

/** @typedef {import("Components/MainPages/SettingsPage/dictionaryLink.js").DictionaryLink} DictionaryLink */

const SettingsOptionRowEdit = ({
	draftTitle,
	onDraftChange,
	onSaveEdit,
	onCancelEdit,
	isUpdatePending,
	saveDisabled,
	link,
	draftLinkedIds,
	onDraftLinkedChange,
	draftLinkHint,
}) => (
	<>
		<input
			type="text"
			className="settings-params__row-input"
			value={draftTitle}
			onChange={onDraftChange}
			disabled={isUpdatePending}
			onKeyDown={(e) => {
				if (e.key === "Enter" && !saveDisabled) onSaveEdit();
				if (e.key === "Escape") onCancelEdit();
			}}
			aria-label="Edit title"
		/>
		<div className="settings-params__item-actions">
			<button
				type="button"
				className="settings-params__save-button"
				onClick={onSaveEdit}
				disabled={saveDisabled}
			>
				{isUpdatePending ? "…" : "Save"}
			</button>
			<button
				type="button"
				className="settings-params__cancel-button"
				onClick={onCancelEdit}
				disabled={isUpdatePending}
			>
				Cancel
			</button>
		</div>
		{link ? (
			<SettingsLinkPicker
				link={link}
				selectedIds={draftLinkedIds}
				onChange={onDraftLinkedChange}
				disabled={isUpdatePending}
				hint={draftLinkHint}
			/>
		) : null}
	</>
);

const SettingsOptionRowView = ({
	item,
	onStartEdit,
	onDeleteItem,
	editingItemId,
	viewActionsLocked,
	link,
}) => (
	<>
		<span className="settings-params__key">
			{item.title}
			{link ? (
				<span className="settings-params__linked-titles">
					{linkedTitles(item, link)}
				</span>
			) : null}
		</span>
		<div className="settings-params__item-actions">
			<button
				type="button"
				className="settings-params__edit-button"
				onClick={() => onStartEdit(item.id, item.title)}
				disabled={viewActionsLocked || editingItemId != null}
			>
				Edit
			</button>
			<button
				type="button"
				className="settings-params__delete-button"
				onClick={() => onDeleteItem(item.id, item.title)}
				disabled={viewActionsLocked}
			>
				Delete
			</button>
		</div>
	</>
);

/**
 * Список элементов справочника с правкой и удалением.
 *
 * @param {object} props
 * @param {Array<{id: number, title: string}>} props.items - Элементы в порядке
 *   показа.
 * @param {(id: number, title: string) => void} props.onDeleteItem - Удалить
 *   элемент; подтверждение спрашивает секция.
 * @param {boolean} props.isDeletePending - Идёт удаление.
 * @param {boolean} props.isAddPending - Идёт добавление.
 * @param {boolean} props.isUpdatePending - Идёт сохранение правки. Пока идёт
 *   любой из трёх запросов, кнопки Edit и Delete заблокированы.
 * @param {number|null} props.editingItemId - id элемента в правке; null —
 *   правки нет. Пока правится один элемент, Edit у остальных заблокирован.
 * @param {string} props.draftTitle - Название в черновике правки.
 * @param {boolean} props.canSaveEdit - Черновик правки отличается от исходного
 *   и заполнен. Решает секция: только она знает, из чего состоит черновик
 *   (есть ли в нём связанные id).
 * @param {(event: import("react").ChangeEvent<HTMLInputElement>) => void} props.onDraftChange -
 *   Ввод в поле названия при правке.
 * @param {(id: number, title: string) => void} props.onStartEdit - Начать
 *   правку элемента.
 * @param {() => void} props.onSaveEdit - Сохранить правку: кнопка Save или Enter.
 * @param {() => void} props.onCancelEdit - Отменить правку: кнопка Cancel
 *   или Escape.
 * @param {DictionaryLink} [props.link] - Привязка к другому справочнику: если
 *   передана, у элементов видны названия связанных, а в правке — чекбоксы.
 * @param {number[]} [props.draftLinkedIds] - Отмеченные в правке id связанных
 *   элементов.
 * @param {(ids: number[]) => void} [props.onDraftLinkedChange] - Вызывается
 *   при переключении чекбокса в правке со всем новым списком отмеченных id.
 * @param {string|null} [props.draftLinkHint] - Подсказка под чекбоксами
 *   в правке: почему Save заблокирована. null — подсказки нет.
 */
export const SettingsOptionsList = ({
	items,
	onDeleteItem,
	isDeletePending,
	isAddPending,
	isUpdatePending,
	editingItemId,
	draftTitle,
	canSaveEdit,
	onDraftChange,
	onStartEdit,
	onSaveEdit,
	onCancelEdit,
	link,
	draftLinkedIds,
	onDraftLinkedChange,
	draftLinkHint,
}) => {
	const viewActionsLocked =
		isAddPending || isDeletePending || isUpdatePending;
	const saveDisabled = viewActionsLocked || !canSaveEdit;

	return (
		<ul className="settings-params__list">
			{(items ?? []).map((item) => {
				const isEditing = editingItemId === item.id;

				return (
					<li key={item.id} className="settings-params__item">
						{isEditing ? (
							<SettingsOptionRowEdit
								draftTitle={draftTitle}
								onDraftChange={onDraftChange}
								onSaveEdit={onSaveEdit}
								onCancelEdit={onCancelEdit}
								isUpdatePending={isUpdatePending}
								saveDisabled={saveDisabled}
								link={link}
								draftLinkedIds={draftLinkedIds}
								onDraftLinkedChange={onDraftLinkedChange}
								draftLinkHint={draftLinkHint}
							/>
						) : (
							<SettingsOptionRowView
								item={item}
								onStartEdit={onStartEdit}
								onDeleteItem={onDeleteItem}
								editingItemId={editingItemId}
								viewActionsLocked={viewActionsLocked}
								link={link}
							/>
						)}
					</li>
				);
			})}
		</ul>
	);
};
