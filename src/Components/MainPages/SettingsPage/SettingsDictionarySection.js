import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsAddRow } from "Components/MainPages/SettingsPage/SettingsAddRow.js";
import { SettingsOptionsList } from "Components/MainPages/SettingsPage/SettingsOptionsList.js";
import { addSettingRequest } from "Components/MainPages/SettingsPage/addSettingRequest.js";
import { deleteSettingRequest } from "Components/MainPages/SettingsPage/deleteSettingRequest.js";
import { updateSettingRequest } from "Components/MainPages/SettingsPage/updateSettingRequest.js";
import { ToggleIconButton } from "Components/ToggleIconButton.js";

import arrowUp from "Assets/Icons/Filters/arrow_up.svg";
import arrowDown from "Assets/Icons/Filters/arrow_down.svg";

import "Styles/MainPages/SettingsPage/SettingsPageContent.scss";

export const SettingsDictionarySection = ({
	title,
	items,
	uploadApiPath,
	updateApiPath,
	deleteApiPath,
	queryKey,
	placeholder,
}) => {
	const queryClient = useQueryClient();
	const panelId = useId();
	const [isExpanded, setIsExpanded] = useState(false);
	const [value, setValue] = useState("");
	const [error, setError] = useState(null);
	const [deleteError, setDeleteError] = useState(null);
	const [updateError, setUpdateError] = useState(null);
	const [editingItemId, setEditingItemId] = useState(null);
	const [draftTitle, setDraftTitle] = useState("");

	// Мутация для добавления нового значения в словарь
	const mutation = useMutation({
		mutationFn: (valueToAdd) =>
			addSettingRequest({ apiPath: uploadApiPath, value: valueToAdd }),
		onSuccess: () => {
			setError(null);
			setValue("");
			queryClient.invalidateQueries({ queryKey: [queryKey] });
		},
		onError: (err) => {
			setError(err.message);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id) =>
			deleteSettingRequest({ apiPath: deleteApiPath, id }),
		onSuccess: () => {
			setDeleteError(null);
			queryClient.invalidateQueries({ queryKey: [queryKey] });
		},
		onError: (err) => {
			setDeleteError(err.message);
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, title }) =>
			updateSettingRequest({ apiPath: updateApiPath, id, title }),
		onSuccess: () => {
			setUpdateError(null);
			setEditingItemId(null);
			setDraftTitle("");
			queryClient.invalidateQueries({ queryKey: [queryKey] });
		},
		onError: (err) => {
			setUpdateError(err.message);
		},
	});

	const editingOriginalTitle =
		items?.find((i) => i.id === editingItemId)?.title ?? "";

	const handleStartEdit = (id, itemTitle) => {
		setUpdateError(null);
		setEditingItemId(id);
		setDraftTitle(itemTitle);
	};

	const handleCancelEdit = () => {
		setEditingItemId(null);
		setDraftTitle("");
		setUpdateError(null);
	};

	const handleSaveEdit = () => {
		if (!editingItemId || updateMutation.isPending) return;
		const trimmed = draftTitle.trim();
		if (!trimmed) {
			setUpdateError("Enter a title");
			return;
		}
		const original = items?.find((i) => i.id === editingItemId)?.title ?? "";
		if (trimmed === original.trim()) {
			handleCancelEdit();
			return;
		}
		setUpdateError(null);
		updateMutation.mutate({ id: editingItemId, title: trimmed });
	};

	const handleDeleteItem = (id, itemTitle) => {
		if (deleteMutation.isPending) return;
		if (!window.confirm(`Delete "${itemTitle}"?`)) return;
		setDeleteError(null);
		if (editingItemId === id) {
			setEditingItemId(null);
			setDraftTitle("");
			setUpdateError(null);
		}
		deleteMutation.mutate(id);
	};

	// Обработчик нажатия на кнопку добавления нового значения в словарь
	const handleSubmit = () => {
		const trimmed = value.trim();
		if (!trimmed || mutation.isPending) return;
		setError(null);
		mutation.mutate(trimmed);
	};

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
					altImg=""
				/>
			</h2>
			<div id={panelId} hidden={!isExpanded} className="settings-params__section-body">
				<SettingsAddRow
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onSubmit={handleSubmit}
					placeholder={placeholder}
					isPending={
						mutation.isPending ||
						deleteMutation.isPending ||
						updateMutation.isPending
					}
				/>
				{error ? (
					<p className="settings-params__add-error" role="alert">
						{error}
					</p>
				) : null}
				<SettingsOptionsList
					items={items}
					onDeleteItem={handleDeleteItem}
					isDeletePending={deleteMutation.isPending}
					isAddPending={mutation.isPending}
					isUpdatePending={updateMutation.isPending}
					editingItemId={editingItemId}
					draftTitle={draftTitle}
					editingOriginalTitle={editingOriginalTitle}
					onDraftChange={(e) => setDraftTitle(e.target.value)}
					onStartEdit={handleStartEdit}
					onSaveEdit={handleSaveEdit}
					onCancelEdit={handleCancelEdit}
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
