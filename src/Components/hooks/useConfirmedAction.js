import { useState } from "react";

/**
 * Действие, требующее подтверждения пользователя: confirm → запрос → успех/ошибка.
 * Берёт на себя гонка-гард (повторный клик, пока запрос в полёте) и флаг занятости.
 *
 * @param {Object} params
 * @param {string} params.confirmText - Текст в окне подтверждения.
 * @param {Function} params.request - Запрос к API, бросает ошибку при провале.
 * @param {Function} [params.onSuccess] - Вызывается после успешного запроса.
 *   Собственные ошибки колбэка провалом действия не считаются и уходят в консоль.
 * @param {Function} [params.onError] - Получает ошибку запроса, но не ошибку `onSuccess`.
 * @param {boolean} [params.disabled] - Внешний запрет на выполнение действия.
 * @returns {{ run: Function, isBusy: boolean, disabled: boolean }}
 *   `disabled` уже учитывает `isBusy` — его можно отдавать кнопке как есть.
 */
export const useConfirmedAction = ({
	confirmText,
	request,
	onSuccess,
	onError,
	disabled = false,
}) => {
	const [isBusy, setIsBusy] = useState(false);

	const run = async () => {
		if (disabled || isBusy) return;
		if (!window.confirm(confirmText)) return;

		setIsBusy(true);
		try {
			let succeeded = false;
			try {
				await request();
				succeeded = true;
			} catch (err) {
				await onError?.(err);
			}

			if (!succeeded) return;

			try {
				await onSuccess?.();
			} catch (err) {
				// Запрос уже прошёл, сломалась постобработка — это баг на клиенте,
				// а не отказ сервера. Через onError сообщать нельзя: пользователь
				// увидит «не удалось» у действия, которое на сервере состоялось,
				// и повторит его — например, опубликует вещь второй раз.
				console.error("onSuccess failed:", err);
			}
		} finally {
			setIsBusy(false);
		}
	};

	return { run, isBusy, disabled: disabled || isBusy };
};
