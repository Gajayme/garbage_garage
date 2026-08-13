import { NotificationWindow } from "Components/NotificationWindow.js";

import "Styles/StatusNotificationWindow.scss";
import "Styles/ColoredText.scss";

const headerTextSucess = "yessssss";
const headerTextError = "nooooooo";

/**
 * Уведомление об исходе действия: успех или ошибка с произвольным текстом.
 * Общее для всех страниц — оформление и заголовки задаются здесь, вызывающей
 * стороне остаётся только состояние.
 *
 * @param {{ notification: { isError: boolean, text: string } | null }} params
 *   `null` означает, что показывать нечего.
 */
export const StatusNotificationWindow = ({ notification }) => {
	const notificationData = notification && {
		headerText: notification.isError ? headerTextError : headerTextSucess,
		mainText: notification.text,
		mainTextColorClassName: notification.isError ? "red-text" : "green-text",
	};

	return (
		<div role="status" aria-live="polite">
			{notificationData && (
				<NotificationWindow
					className="status-notification-window"
					mainTextClassName="status-notification-main-text"
					notificationData={notificationData}
				/>
			)}
		</div>
	);
};
