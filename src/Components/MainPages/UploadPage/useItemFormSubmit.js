import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "Components/Auth/AuthContext.js";
import { FormDataLogger } from "Components/FormDataLogger.js";
import { UploadFormValidation } from "Components/MainPages/UploadPage/Validations/Validations.js";
import { VALIDATION_MAPPER } from "Components/MainPages/UploadPage/uploadFormFields.js";
import { buildItemFormData } from "Components/MainPages/UploadPage/buildItemFormData.js";
import {
	invalidateItemLists,
	invalidateItem,
} from "Components/utils/itemCache.js";
import * as Constants from "Constants.js";

/**
 * Отправка формы UploadPage: создание вещи (POST) или её редактирование (PUT).
 *
 * Режим выбирается по `editItemId`, как и в useHydrateUploadForm: пустой —
 * создание, иначе редактирование этой вещи.
 *
 * Контракт:
 *  - `editItemId` уже валиден (мусор отсеян на уровне UploadPage);
 *  - `formState` — текущее состояние формы, из него собирается тело запроса;
 *  - `setErrorState` — сеттер ошибок формы, в него пишется результат валидации;
 *  - `onCreated` — сброс формы после успешного создания;
 *  - `notifySuccess` / `notifyError` — показать пользователю итог отправки.
 *
 * @returns {{ submit: Function, isBusy: boolean }}
 *   `isBusy` — запрос в полёте; пока он true, повторный `submit` ничего не делает.
 */
export const useItemFormSubmit = ({
	editItemId,
	formState,
	setErrorState,
	onCreated,
	notifySuccess,
	notifyError,
}) => {
	const queryClient = useQueryClient();
	const { isAdmin, checkAuth } = useAuth();

	// isBusy - гард на повторный submit, пока идёт запрос.
	const [isBusy, setIsBusy] = useState(false);

	const validate = () => {
		const errors = UploadFormValidation(formState, VALIDATION_MAPPER);
		setErrorState(errors);
		return Object.values(errors).every((errorArray) => errorArray.length === 0);
	};

	// Чем различаются режимы:
	//   - url, method    — куда и каким методом отправлять multipart-тело;
	//   - afterSuccess   — что сделать с успешным ответом (сброс формы / инвалидация кеша);
	//   - errorLogPrefix — префикс для console.error: отказ fetch, ответ не ok и
	//                      исключения. Отказ по isAdmin, ошибки валидации и 401 не логируются.
	const describeRequest = () => {
		if (!editItemId) {
			return {
				url: `${Constants.base_server_url}${Constants.post_upload}`,
				method: Constants.http_methods.POST,
				errorLogPrefix: "upload error:",
				// Сброс формы — первым: разбор ответа нужен только для лога и падает
				// на теле без JSON, а не сброшенная после уведомления об успехе форма
				// подталкивает загрузить ту же вещь ещё раз.
				afterSuccess: async (response) => {
					onCreated?.();
					await invalidateItemLists(queryClient);
					const responseJson = await response.json();
					console.log("upload response:", responseJson);
				},
			};
		}

		return {
			url: `${Constants.base_server_url}${Constants.postUpdate(editItemId)}`,
			method: Constants.http_methods.PUT,
			errorLogPrefix: "update error:",
			// Инвалидации независимы — запускаем параллельно. Ждём их обе
			// намеренно: пока идёт догрузка деталей, кнопка отправки остаётся
			// заблокированной. Сети касается только invalidateItem — список
			// каталога и базы отсюда неактивны, для них инвалидация сводится
			// к синхронной пометке «протухло».
			afterSuccess: () =>
				Promise.all([
					invalidateItemLists(queryClient),
					invalidateItem(queryClient, editItemId),
				]),
		};
	};

	const submit = async () => {
		if (isBusy) return;
		const { url, method, errorLogPrefix, afterSuccess } = describeRequest();
		setIsBusy(true);
		try {
			if (!isAdmin) {
				notifyError();
				return;
			}

			if (!validate()) return;

			// fetch отклоняется, когда ответа нет или его нельзя прочитать: сеть,
			// обрыв соединения, CORS — в том числе страница ошибки прокси без
			// CORS-заголовков. Дошёл ли запрос до сервера, отсюда не узнать.
			// Сюда же попадает исключение из buildItemFormData — в этом случае
			// запрос точно не ушёл.
			let response;
			try {
				const body = buildItemFormData(formState);
				FormDataLogger(body);
				response = await fetch(url, {
					method,
					body,
					credentials: "include",
				});
			} catch (error) {
				console.error(errorLogPrefix, error);
				notifyError();
				return;
			}

			if (response.status === 401) {
				await checkAuth();
				notifyError();
				return;
			}

			if (!response.ok) {
				console.error(errorLogPrefix, `Server error: ${response.status}`);
				notifyError();
				return;
			}

			notifySuccess();
			await afterSuccess(response);
		} catch (error) {
			// Об ошибке не уведомляем из-за сбоя постобработки в afterSuccess: сервер
			// запрос уже принял, и «upload failed» заставит повторить загрузку —
			// то есть создать дубликат. Так же молча уходят в лог исключения из
			// validate и из checkAuth в ветке 401, хотя там запрос не прошёл.
			console.error(errorLogPrefix, error);
		} finally {
			setIsBusy(false);
		}
	};

	return { submit, isBusy };
};
