import { Navigate, useParams } from "react-router-dom";

import { UploadPageForm } from './UploadPageForm';
import { StatusNotificationWindow } from "Components/StatusNotificationWindow.js";
import { useResetStateWithTimeout } from "Components/hooks/useResetStateWithTimeout.js";
import { isValidPostId } from "Components/utils/isValidPostId.js";
import * as Nav from "Components/Navigation/paths.js";

export const UploadPage = () => {
	const { itemId } = useParams();

	const notificationWindowLifetime = 2000
	const [notification, setNotification] =
		useResetStateWithTimeout(null, null, notificationWindowLifetime);

	// Если в URL передан itemId — он обязан быть валидным id вещи.
	// На мусорные значения отправляем пользователя в режим создания.
	// Ранний return — после всех хуков, чтобы их количество было стабильным между рендерами.
	if (itemId != null && !isValidPostId(itemId)) {
		return <Navigate to={`/${Nav.upload}`} replace />;
	}


	// key пересоздаёт форму при смене вещи или режима. React Router не
	// размонтирует страницу при переходе между /upload и /upload/edit/:itemId:
	// у обоих маршрутов одно и то же дерево элементов. Без key форма создания
	// досталась бы заполненной данными редактируемой вещи, и Upload создал бы
	// её копию. Значение "create" с id не совпадёт: id — только цифры.
	return (
	<>
		<UploadPageForm
			key={itemId ?? "create"}
			editItemId={itemId}
			notificationSetter={setNotification}
		/>
		<StatusNotificationWindow notification={notification} />
	</>
	)
}
