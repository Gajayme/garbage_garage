import { Navigate, useParams } from "react-router-dom";

import { UploadPageForm } from './UploadPageForm';
import { UploadNotificationState } from './UploadPageNotificationWindow'
import { UploadPageNotificationWindow } from "./UploadPageNotificationWindow";
import { useResetStateWithTimeout } from "Components/hooks/useResetStateWithTimeout.js";
import { isValidPostId } from "Components/utils/isValidPostId.js";
import * as Nav from "Components/Navigation/paths.js";

export const UploadPage = () => {
	const { itemId } = useParams();

	const notificationWindowLifetime = 2000
	const [notificationState, setNotificationState] =
		useResetStateWithTimeout(
			UploadNotificationState.IDLE,
			UploadNotificationState.IDLE,
			notificationWindowLifetime
		);

	// Если в URL передан itemId — он обязан быть валидным id вещи.
	// На мусорные значения отправляем пользователя в режим создания.
	// Ранний return — после всех хуков, чтобы их количество было стабильным между рендерами.
	if (itemId != null && !isValidPostId(itemId)) {
		return <Navigate to={`/${Nav.upload}`} replace />;
	}


	return (
	<>
		<UploadPageForm
			editItemId={itemId}
			notificationStateSetter={setNotificationState}
		/>
		<UploadPageNotificationWindow notificationState={notificationState}/>
	</>
	)
}
