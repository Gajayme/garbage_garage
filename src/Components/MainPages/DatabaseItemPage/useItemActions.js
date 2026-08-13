import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "Components/Auth/AuthContext.js";
import { useConfirmedAction } from "Components/hooks/useConfirmedAction.js";
import { useResetStateWithTimeout } from "Components/hooks/useResetStateWithTimeout.js";
import { deleteItem } from "Components/Api/deleteItem.js";
import {
	sendItemToInstagram,
	sendItemToTelegram,
} from "Components/Api/sendItemToSocial.js";
import * as Nav from "Components/Navigation/paths.js";
import * as Constants from "Constants.js";

const notificationWindowLifetime = 2000;

/**
 * Действия над вещью на странице базы: удаление, редактирование и публикация
 * в соцсети. Владеет флагами занятости и уведомлением о результате.
 *
 * @param {string} itemId - Id вещи из URL.
 * @returns {{
 *   notification: { isError: boolean, text: string } | null,
 *   actions: Array<{ label: string, onClick: Function, disabled: boolean }>
 * }} `actions` в порядке отображения кнопок; одновременно доступно не более
 *   одного действия.
 */
export const useItemActions = (itemId) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { checkAuth } = useAuth();
	const [notification, setNotification] = useResetStateWithTimeout(
		null,
		null,
		notificationWindowLifetime
	);

	// Общая обработка провала: на 401 перепроверяем сессию, остальное — в консоль.
	const notifyFailure = async (actionLabel, err) => {
		if (err?.status === 401) {
			await checkAuth();
		} else {
			console.error(`${actionLabel} failed:`, err?.status ?? err);
		}
		setNotification({ isError: true, text: `${actionLabel} failed` });
	};

	const deleteAction = useConfirmedAction({
		confirmText: "Delete this item?",
		disabled: !itemId,
		request: () => deleteItem({ itemID: itemId }),
		onSuccess: async () => {
			// Инвалидируем все в бд и в каталоге
			await queryClient.invalidateQueries({ queryKey: [Constants.itemsQueryKey] });
			await queryClient.invalidateQueries({
				queryKey: [Constants.itemsPrivateQueryKey],
			});
			navigate(`/${Nav.database}`);
		},
		onError: (err) => notifyFailure("Delete", err),
	});

	// Публикация в соцсеть: отличается от удаления только тем, что после успеха
	// показывает уведомление, а не уходит со страницы.
	const notifySent = (channelLabel) =>
		setNotification({ isError: false, text: `posted to ${channelLabel}` });

	const instagramAction = useConfirmedAction({
		confirmText: "Post this item to Instagram?",
		disabled: !itemId,
		request: () => sendItemToInstagram({ itemID: itemId }),
		onSuccess: () => notifySent("Instagram"),
		onError: (err) => notifyFailure("Instagram", err),
	});

	const telegramAction = useConfirmedAction({
		confirmText: "Post this item to Telegram?",
		disabled: !itemId,
		request: () => sendItemToTelegram({ itemID: itemId }),
		onSuccess: () => notifySent("Telegram"),
		onError: (err) => notifyFailure("Telegram", err),
	});

	const handleEditItem = () => {
		if (!itemId) return;
		navigate(Nav.uploadEdit(itemId));
	};

	// Действия взаимоисключающие: пока одно в полёте, остальные заблокированы —
	// иначе можно опубликовать вещь, которая в этот момент удаляется.
	const isAnyBusy =
		deleteAction.isBusy || instagramAction.isBusy || telegramAction.isBusy;

	const actions = [
		{
			label: "Delete",
			onClick: deleteAction.run,
			disabled: deleteAction.disabled || isAnyBusy,
		},
		{ label: "Edit", onClick: handleEditItem, disabled: !itemId || isAnyBusy },
		{
			label: "Instagram",
			onClick: instagramAction.run,
			disabled: instagramAction.disabled || isAnyBusy,
		},
		{
			label: "Telegram",
			onClick: telegramAction.run,
			disabled: telegramAction.disabled || isAnyBusy,
		},
	];

	return { notification, actions };
};
