import { useId, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsAddRow } from "Components/MainPages/SettingsPage/SettingsAddRow.js";
import { SettingsOptionsList } from "Components/MainPages/SettingsPage/SettingsOptionsList.js";
import { SettingsLinkPicker } from "Components/MainPages/SettingsPage/SettingsLinkPicker.js";
import {
	linkedIdsOf,
	linkRequiredHint,
} from "Components/MainPages/SettingsPage/dictionaryLink.js";
import { addSettingRequest } from "Components/MainPages/SettingsPage/addSettingRequest.js";
import { deleteSettingRequest } from "Components/MainPages/SettingsPage/deleteSettingRequest.js";
import { updateSettingRequest } from "Components/MainPages/SettingsPage/updateSettingRequest.js";
import { ToggleIconButton } from "Components/ToggleIconButton.js";
import { compareByTitle } from "Components/utils/labelCollator.js";

import arrowUp from "Assets/Icons/Filters/arrow_up.svg";
import arrowDown from "Assets/Icons/Filters/arrow_down.svg";

import "Styles/MainPages/SettingsPage/SettingsPageContent.scss";

// Значения по умолчанию для необязательных пропов — в module scope (а
// compareByTitle — импорт). Для compareItems это обязательно: он в зависимостях
// useMemo сортировки, и функция, созданная заново в параметрах,
// пересортировывала бы список на каждом рендере.
const buildTitleBody = (title) => ({ title });
const NO_RELATED_KEYS = [];

const sameIds = (a, b) =>
	a.length === b.length && a.every((id) => b.includes(id));

/** @typedef {import("Components/MainPages/SettingsPage/dictionaryLink.js").DictionaryLink} DictionaryLink */

/**
 * Секция одного справочника на странице настроек: добавление, правка, удаление.
 *
 * @param {object} props
 * @param {string} props.title - Заголовок секции: текст кнопки, которая её
 *   разворачивает и сворачивает (по умолчанию секция свёрнута).
 * @param {Array<{id: number, title: string}>|undefined} props.items - Элементы
 *   справочника из useInputParams. С `link` в каждом есть ещё поле
 *   `link.itemField` со связанными элементами. undefined (запрос справочника
 *   не удался) показывается как пустой список.
 * @param {string} props.uploadApiPath - Путь добавления из Constants.js
 *   (`brandUploadApi` и т.п.).
 * @param {string} props.updateApiPath - Путь правки; id элемента дописывается
 *   к нему через `withId`.
 * @param {string} props.deleteApiPath - Путь удаления; id дописывается так же.
 * @param {string} props.queryKey - Ключ запроса этого справочника из Constants.js
 *   (`brandsQueryKey` и т.п.): после добавления, правки и удаления запрос
 *   инвалидируется, и список перезапрашивается.
 * @param {string} props.placeholder - Подсказка в пустом поле добавления.
 * @param {DictionaryLink} [props.link] - Привязка элементов к другому
 *   справочнику. Передана — чекбоксы его элементов при добавлении и правке,
 *   названия связанных в просмотре.
 * @param {(title: string, linkedIds: number[]) => object} [props.buildBody] -
 *   Сборка тела запросов добавления и правки из названия и id связанных
 *   элементов (без `link` — пустой массив); по умолчанию возвращает { title }.
 * @param {(a: object, b: object) => number} [props.compareItems] - Порядок
 *   элементов; по умолчанию по алфавиту названий.
 * @param {string[]} [props.relatedQueryKeys] - Чьи ещё запросы инвалидировать
 *   после изменения: справочники, в ответ которых входят элементы этого.
 */
export const SettingsDictionarySection = ({
	title,
	items,
	uploadApiPath,
	updateApiPath,
	deleteApiPath,
	queryKey,
	placeholder,
	link,
	buildBody = buildTitleBody,
	compareItems = compareByTitle,
	relatedQueryKeys = NO_RELATED_KEYS,
}) => {
	const queryClient = useQueryClient();
	const panelId = useId();
	const [isExpanded, setIsExpanded] = useState(false);
	const [value, setValue] = useState("");
	const [newLinkedIds, setNewLinkedIds] = useState([]);
	const [addError, setAddError] = useState(null);
	const [deleteError, setDeleteError] = useState(null);
	const [updateError, setUpdateError] = useState(null);
	const [editingItemId, setEditingItemId] = useState(null);
	const [draftTitle, setDraftTitle] = useState("");
	const [draftLinkedIds, setDraftLinkedIds] = useState([]);

	const hasLink = link != null;
	const isLinkRequired = Boolean(link?.required);

	const sortedItems = useMemo(
		() => [...(items ?? [])].sort(compareItems),
		[items, compareItems]
	);

	const invalidate = () =>
		[queryKey, ...relatedQueryKeys].forEach((key) =>
			queryClient.invalidateQueries({ queryKey: [key] })
		);

	const addMutation = useMutation({
		mutationFn: (body) =>
			addSettingRequest({ apiPath: uploadApiPath, body }),
		onSuccess: () => {
			setAddError(null);
			setValue("");
			setNewLinkedIds([]);
			invalidate();
		},
		onError: (err) => {
			setAddError(err.message);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id) =>
			deleteSettingRequest({ apiPath: deleteApiPath, id }),
		onSuccess: () => {
			setDeleteError(null);
			invalidate();
		},
		onError: (err) => {
			setDeleteError(err.message);
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, body }) =>
			updateSettingRequest({ apiPath: updateApiPath, id, body }),
		onSuccess: () => {
			setUpdateError(null);
			setEditingItemId(null);
			setDraftTitle("");
			setDraftLinkedIds([]);
			invalidate();
		},
		onError: (err) => {
			setUpdateError(err.message);
		},
	});

	const editingItem = sortedItems.find((i) => i.id === editingItemId);
	const editingOriginalTitle = editingItem?.title ?? "";

	const trimmedDraft = draftTitle.trim();
	const isDraftChanged =
		trimmedDraft !== editingOriginalTitle.trim() ||
		(hasLink && !sameIds(draftLinkedIds, linkedIdsOf(editingItem, link)));
	const canSaveEdit =
		trimmedDraft !== "" &&
		(!isLinkRequired || draftLinkedIds.length > 0) &&
		isDraftChanged;

	// Подсказки под чекбоксами, когда Add или Save заблокированы из-за пустой
	// обязательной привязки: иначе видна только неактивная кнопка без причины.
	// При добавлении — только когда название уже введено: на пустой строке
	// причина блокировки и так очевидна.
	const addLinkHint =
		isLinkRequired && value.trim() !== "" && newLinkedIds.length === 0
			? linkRequiredHint(link)
			: null;
	const editLinkHint =
		isLinkRequired && editingItemId != null && draftLinkedIds.length === 0
			? linkRequiredHint(link)
			: null;

	const handleStartEdit = (id, itemTitle) => {
		setUpdateError(null);
		setEditingItemId(id);
		setDraftTitle(itemTitle);
		setDraftLinkedIds(linkedIdsOf(sortedItems.find((i) => i.id === id), link));
	};

	const handleCancelEdit = () => {
		setEditingItemId(null);
		setDraftTitle("");
		setDraftLinkedIds([]);
		setUpdateError(null);
	};

	const handleSaveEdit = () => {
		if (!editingItemId || updateMutation.isPending) return;
		if (!trimmedDraft) {
			setUpdateError("Enter a title");
			return;
		}
		// Причину уже показывает editLinkHint.
		if (isLinkRequired && draftLinkedIds.length === 0) return;
		if (!isDraftChanged) {
			handleCancelEdit();
			return;
		}
		setUpdateError(null);
		updateMutation.mutate({
			id: editingItemId,
			body: buildBody(trimmedDraft, draftLinkedIds),
		});
	};

	const handleDeleteItem = (id, itemTitle) => {
		if (deleteMutation.isPending) return;
		if (!window.confirm(`Delete "${itemTitle}"?`)) return;
		setDeleteError(null);
		if (editingItemId === id) {
			handleCancelEdit();
		}
		deleteMutation.mutate(id);
	};

	// Добавление: кнопка Add или Enter в поле.
	const handleSubmit = () => {
		const trimmed = value.trim();
		if (!trimmed || addMutation.isPending) return;
		// Причину уже показывает addLinkHint.
		if (isLinkRequired && newLinkedIds.length === 0) return;
		setAddError(null);
		addMutation.mutate(buildBody(trimmed, newLinkedIds));
	};

	const isAnyPending =
		addMutation.isPending ||
		deleteMutation.isPending ||
		updateMutation.isPending;

	return (
		<section className="settings-params__group">
			<h2 className="settings-params__title settings-params__title--collapsible">
				<ToggleIconButton
					labelText={title}
					className="settings-params__section-toggle"
					iconClassName="settings-params__section-toggle-icon"
					iconInactive={arrowDown}
					iconActive={arrowUp}
					onClick={() => setIsExpanded((open) => !open)}
					isActive={isExpanded}
					disclosure
					aria-controls={panelId}
				/>
			</h2>
			<div id={panelId} hidden={!isExpanded} className="settings-params__section-body">
				<SettingsAddRow
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onSubmit={handleSubmit}
					placeholder={placeholder}
					isPending={isAnyPending}
					canSubmit={value.trim() !== "" && (!isLinkRequired || newLinkedIds.length > 0)}
				>
					{hasLink ? (
						<SettingsLinkPicker
							link={link}
							selectedIds={newLinkedIds}
							onChange={setNewLinkedIds}
							disabled={isAnyPending}
							hint={addLinkHint}
						/>
					) : null}
				</SettingsAddRow>
				{addError ? (
					<p className="settings-params__add-error" role="alert">
						{addError}
					</p>
				) : null}
				<SettingsOptionsList
					items={sortedItems}
					onDeleteItem={handleDeleteItem}
					isDeletePending={deleteMutation.isPending}
					isAddPending={addMutation.isPending}
					isUpdatePending={updateMutation.isPending}
					editingItemId={editingItemId}
					draftTitle={draftTitle}
					canSaveEdit={canSaveEdit}
					onDraftChange={(e) => setDraftTitle(e.target.value)}
					onStartEdit={handleStartEdit}
					onSaveEdit={handleSaveEdit}
					onCancelEdit={handleCancelEdit}
					link={link}
					draftLinkedIds={draftLinkedIds}
					onDraftLinkedChange={setDraftLinkedIds}
					draftLinkHint={editLinkHint}
				/>
				{updateError ? (
					<p className="settings-params__add-error" role="alert">
						{updateError}
					</p>
				) : null}
				{deleteError ? (
					<p className="settings-params__add-error" role="alert">
						{deleteError}
					</p>
				) : null}
			</div>
		</section>
	);
};
