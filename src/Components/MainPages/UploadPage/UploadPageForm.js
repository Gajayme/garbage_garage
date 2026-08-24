import { useCallback, useMemo, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from "@tanstack/react-query";

import { DefaultButton } from "Components/Button.js"
import { FormDataLogger } from "Components/FormDataLogger.js";
import { UploadFormValidation } from './Validations/Validations.js'
import { ImageManagerWindow } from "./ImageManager/ImageManagerWindow.js"
import { LabeledInput } from "Components/MainPages/UploadPage/LabeledInput.js"
import { LabeledTextArea } from "Components/MainPages/UploadPage/LabeledTextArea.js"
import { LabeledDropdown } from "Components/MainPages/UploadPage/LabeledDropDown.js"
import { useInputParams } from "Components/hooks/useInputParams.js";
import { useAuth } from "Components/Auth/AuthContext.js";
import * as UploadConstants from "Components/MainPages/UploadPage/UploadPageConstants.js";
import { useHydrateUploadForm } from "Components/MainPages/UploadPage/useHydrateUploadForm.js";
import { normalizeFk, normalizeStatus } from "Components/MainPages/UploadPage/uploadFormNormalize.js";
import { revokeBlobImage, revokeBlobImages } from "Components/MainPages/UploadPage/imageBlobs.js";
import { urlToFile } from "Components/utils/urlToFile.js";
import {
	INPUT_DEFS,
	DROPDOWN_DEFS,
	TEXT_AREA_DEFS,
	FIELD_DEFS,
	INITIAL_FORM,
	INITIAL_ERRORS,
	VALIDATION_MAPPER,
} from "Components/MainPages/UploadPage/uploadFormFields.js";
import {
	invalidateItemLists,
	invalidateItem,
} from "Components/utils/itemCache.js";

import * as Constants from 'Constants.js'

import 'Styles/MainPages/UploadPage/UploadPageForm.scss'
import 'Styles/MainPages/UploadPage/UploadPageButton.scss'
import DefaultImg from "Assets/Images/default.jpg"


// Слой отправки лежит поверх всего, поэтому drag-события во время запроса
// приходят в него, а не в .image-manager с его preventDefault. Без отмены
// дефолта браузер считает, что drop-зоны на странице нет, и открывает
// брошенный файл — то есть уводит со страницы посреди запроса.
// dropEffect — не защита, а курсор «сюда нельзя» вместо «копировать».
const swallowDragOver = (event) => {
	event.preventDefault();
	event.dataTransfer.dropEffect = "none";
};
const swallowDrop = (event) => event.preventDefault();


// Тексты уведомлений о результате отправки формы.
const mainTextSucess = "sucess"
const mainTextError = "upload failed"



export const UploadPageForm = ({
	notificationSetter,
	editItemId,
}) => {

	// Если editItemId не null, то режим редактирования, иначе создание.
	const mode =
		editItemId != null && editItemId !== ""
			? UploadConstants.uploadModeEdit
			: UploadConstants.uploadModeCreate;
	const isEdit = mode === UploadConstants.uploadModeEdit;


	// хук, который занимается загрузкой инпут параметров с сервера
	const { brands, types, buyers, locations, statuses, isLoading } = useInputParams();
	// хук, который занимается аутентификацией
	const { isAdmin, checkAuth } = useAuth();

	// клиент запросов для обновления данных в кеше
	const queryClient = useQueryClient();


	// Сбор опций для дропдаунов
	// Берём статический конфиг DROPDOWN_DEFS и достраиваем для каждой записи `options`,
	// собранные подходящим билдером из соответствующего справочника useInputParams.
	// Пересчёт идёт только при смене самих справочников, поэтому ссылки на options
	// и на сам массив dropdownFields стабильны между «спокойными» рендерами.
	const dropdownFields = useMemo(() => {
		const dataByKey = { brands, types, buyers, locations, statuses };
		return DROPDOWN_DEFS.map(({ dataKey, placeholder, builder, ...rest }) => ({
			...rest,
			options: builder(dataByKey[dataKey], placeholder, UploadConstants.defaultID),
		}));
	}, [brands, types, buyers, locations, statuses]);

	// Происходит ли отправка формы прямо сейчас
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	// Любая сетевая операция формы в данный момент. Единая точка для
	// гонка-гарда в submitForm и для disabled у кнопок.
	const isBusy = isSubmitting || isUpdating;

	// стейты со значениями полей и ошибок (используем стабильные module-scope константы)
	const [formState, setFormState] = useState(INITIAL_FORM);
	const [errorState, setErrorState] = useState(INITIAL_ERRORS);

	// Локальные хелперы «покажи ошибку / покажи успех». Прячут форму состояния
	// уведомления — места вызова описывают намерение, а не способ. Обёрнуты
	// в useCallback, чтобы ссылки были стабильны и их можно было передавать
	// в кастомные хуки без перезапуска их useEffect.
	const showError = useCallback(
		() => notificationSetter({ isError: true, text: mainTextError }),
		[notificationSetter]
	);
	const showSuccess = useCallback(
		() => notificationSetter({ isError: false, text: mainTextSucess }),
		[notificationSetter]
	);

	// Гидрация формы данными вещи в edit-режиме — целиком в кастомном хуке.
	useHydrateUploadForm({
		editItemId,
		paramsLoading: isLoading,
		setFormState,
		setErrorState,
		initialErrors: INITIAL_ERRORS,
		onError: showError,
	});

	// Общий каркас отправки формы: гонка-гард, isAdmin, валидация, fetch, 401, нотификации, finally.
	// Параметры различия между upload/update:
	//   - url            — куда отправлять POST с multipart-телом;
	//   - setBusy        — какой флаг загрузки переключать;
	//   - onSuccess      — что сделать с успешным ответом (reset формы / invalidate кеша);
	//   - errorLogPrefix — префикс для console.error в catch-ветке.
	const submitForm = async ({
		url,
		setBusy,
		onSuccess,
		errorLogPrefix,
		method = Constants.http_methods.POST,
	}) => {
		if (isBusy) return;
		setBusy(true);
		try {
			if (!isAdmin) {
				showError();
				return;
			}

			if (!validateForm()) return;

			const response = await fetch(url, {
				method,
				body: buildFormData(),
				credentials: "include",
			});

			if (response.status === 401) {
				await checkAuth();
				showError();
				return;
			}

			response.ok ? showSuccess() : showError();
			if (!response.ok) {
				throw new Error(`Server error: ${response.status}`);
			}

			await onSuccess?.(response);
		} catch (error) {
			console.error(errorLogPrefix, error);
		} finally {
			setBusy(false);
		}
	};

	// обработчик отправки формы для создания
	const handleOnSubmit = async (event) => {
		event.preventDefault();
		await submitForm({
			url: `${Constants.base_server_url}${Constants.post_upload}`,
			setBusy: setIsSubmitting,
			onSuccess: async (response) => {
				const responseJson = await response.json();
				console.log("upload response:", responseJson);
				resetForm();
				await invalidateItemLists(queryClient);
			},
			errorLogPrefix: "upload error:",
		});
	};

	// обработчик отправки формы для редактирования
	const handleUpdateSubmit = async () => {
		if (!isEdit) return;

		await submitForm({
			url: `${Constants.base_server_url}${Constants.postUpdate(editItemId)}`,
			method: Constants.http_methods.PUT,
			setBusy: setIsUpdating,
			// Инвалидации независимы — запускаем параллельно. Ждём их обе
			// намеренно: пока идёт догрузка деталей, кнопка Update остаётся
			// заблокированной. Сети касается только invalidateItem — список
			// каталога и базы отсюда неактивны, для них инвалидация сводится
			// к синхронной пометке «протухло».
			onSuccess: () =>
				Promise.all([
					invalidateItemLists(queryClient),
					invalidateItem(queryClient, editItemId),
				]),
			errorLogPrefix: "update error:",
		});
	};

	const validateForm = () => {
		const errorsLocal = UploadFormValidation(
			formState,
			VALIDATION_MAPPER
		);

		setErrorState(errorsLocal);
		return Object.values(errorsLocal).every(
			(errorArray) => errorArray.length === 0
		);
	};

	// компоновка данных для отправки на сервер
	const buildFormData = () => {
		const formData = new FormData();
		FIELD_DEFS.forEach(({ name, apiField, serialize }) => {
			const value = formState[name];
			formData.append(apiField ?? name, serialize ? serialize(value) : value);
		});
		formState.images.forEach((image) => {
			if (image?.file) {
				formData.append(Constants.files, image.file);
			}
		});

		FormDataLogger(formData)
		return formData
	}

	// сброс формы
	const resetForm = () => {
		revokeBlobImages(formState.images);
		setFormState(INITIAL_FORM);
		setErrorState(INITIAL_ERRORS);
	};

	const handleOnChangeInput = (key) => {
		return (event) => {
			if (event && event.target) {
				setFormState((prevState) => ({
						...prevState, [key]: event.target.value}))
				}
		}
	}

	const handleOnChangeDropDown = (key) => {
		const normalize = key === Constants.status ? normalizeStatus : normalizeFk;
		return (newVal) => {
			setFormState((prevState) => ({
				...prevState,
				[key]: normalize(newVal),
			}));
		};
	};

	// Общая логика добавления файлов изображений в форму.
	// Принимает FileList/массив напрямую, чтобы переиспользоваться
	// и для <input>, и для drag-and-drop.
	const addImageFiles = (fileList) => {
		const files = Array.from(fileList || []).filter(
			(file) => file.type.startsWith("image/")
		);
		if (files.length === 0) return;

		const newImages = files.map((file) => ({
			id: uuidv4(),
			file,
			src: URL.createObjectURL(file),
		}));
		setFormState((prevState) => ({
			...prevState,
			images: [...prevState.images, ...newImages],
		}));
	};

	// удалить все изображения
	const handleOnDeleteAllImages = () => {
		revokeBlobImages(formState.images);
		setFormState((prev) => ({ ...prev, images: [] }));
	};

	// переставить изображение: fromId вставляется в toId (drag-and-drop).
	// Порядок в массиве определяет и порядок отправки файлов на сервер.
	const handleOnReorderImages = (fromId, toId) => {
		if (fromId === toId) return;
		setFormState((prev) => {
			const images = [...prev.images];
			const fromIndex = images.findIndex((img) => img.id === fromId);
			const toIndex = images.findIndex((img) => img.id === toId);
			if (fromIndex === -1 || toIndex === -1) return prev;
			const [moved] = images.splice(fromIndex, 1);
			images.splice(toIndex, 0, moved);
			return { ...prev, images };
		});
	};

	// удалить конкретное изображения
	const handleOnDeleteSpecificImage = (id) => {
		setFormState((prev) => {
			revokeBlobImage(prev.images.find((img) => img.id === id));
			return {
				...prev,
				images: prev.images.filter((img) => img.id !== id),
			};
		});
	};

	// Первое реальное (не плейсхолдер) значение дропдауна. Хардкодить id нельзя:
	// справочники живут на сервере, и записи с конкретным id может не быть —
	// тогда <select> не найдёт подходящий <option> и поле останется пустым.
	const firstDropdownValue = (name) => {
		const options = dropdownFields.find((field) => field.name === name)?.options ?? {};
		return (
			Object.values(options).find((value) => value !== UploadConstants.defaultID) ?? null
		);
	};

	// Автозаполнение всех полей для теста
	const handleOnTestAutofill = async () => {

		const imgFile = await urlToFile(DefaultImg, 'default.jpg')
		const imageObject = {
			id: uuidv4(),
			src: DefaultImg,
			file: imgFile,
		};

		setFormState({
			[Constants.itemName]: 'Adidas Sneakers',
			[Constants.model]: 'Superstar',
			[Constants.boughtFor]: '5000',
			[Constants.price]: '8500',
			[Constants.buyersPart]: '50',
			[Constants.soldFor]: '8000',
			[Constants.size]: '42',
			[Constants.buyer]: firstDropdownValue(Constants.buyer),
			[Constants.location]: firstDropdownValue(Constants.location),
			[Constants.brand]: firstDropdownValue(Constants.brand),
			[Constants.type]: firstDropdownValue(Constants.type),
			[Constants.status]: firstDropdownValue(Constants.status),
			[Constants.description]: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			images: [imageObject]
		});
	};

	if (isLoading) {
		return (
			<p className="centered-text">{"Loading..."}</p>
		);
	}

	return (

		<form className="upload-page-form" onSubmit={handleOnSubmit} aria-busy={isBusy}>

			{/* Один disabled на весь fieldset выключает все поля и кнопки формы
			   на время запроса — нативно, без прокидывания disabled в каждый компонент. */}
			<fieldset className="upload-form-fields" disabled={isBusy}>

				<ImageManagerWindow
					images={formState.images}
					errors={errorState.images}
					onAddFiles={addImageFiles}
					onDelete={handleOnDeleteAllImages}
					onDeleteSpecific={handleOnDeleteSpecificImage}
					onReorder={handleOnReorderImages}
				/>

				<div className="upload-form-inputs">
					{INPUT_DEFS.map(({ name, label, id, maxLength, inputValidator }) => (
						<LabeledInput
							key={name}
							value={formState[name]}
							errors={errorState[name]}
							onChange={handleOnChangeInput(name)}
							className="upload-form-item"
							labelText={label}
							id={id}
							maxLength={maxLength}
							inputValidator={inputValidator}
						/>
					))}
					{dropdownFields.map(({ name, label, id, options }) => (
						<LabeledDropdown
							key={name}
							value={formState[name]}
							errors={errorState[name]}
							onChange={handleOnChangeDropDown(name)}
							className="upload-form-item"
							labelText={label}
							id={id}
							options={options}
						/>
					))}
					{TEXT_AREA_DEFS.map(({ name, label, id, maxLength, rows, inputValidator, placeholder }) => (
						<LabeledTextArea
							key={name}
							value={formState[name]}
							errors={errorState[name]}
							onChange={handleOnChangeInput(name)}
							className="upload-form-item"
							labelText={label}
							id={id}
							maxLength={maxLength}
							rows={rows}
							inputValidator={inputValidator}
							placeholder={placeholder}
						/>
					))}
				</div>

				<div className="upload-form-actions">
					{!isEdit && (
						<DefaultButton
						className={"upload-page-button"}
						labelText={UploadConstants.buttonUpload}
						disabled={isBusy}
						type="submit"
						onClick={handleOnSubmit}
					/>
					)}
					{isEdit && (
						<DefaultButton
							className={"upload-page-button"}
							labelText={UploadConstants.buttonSave}
							disabled={isBusy}
							type="button"
							onClick={handleUpdateSubmit}
						/>
					)}
				</div>

				<DefaultButton labelText={'TEST AUTO FILL'} type="button" onClick={handleOnTestAutofill}/>

			</fieldset>

			{/* Слой, появляющийся поверх всего, пока пользователь ждет ответ от бекенда
			после нажания на кнопку "загрузить" */}
			{isBusy && (
				<div
					className="upload-page-pending-backdrop"
					aria-hidden="true"
					onDragOver={swallowDragOver}
					onDrop={swallowDrop}
				/>
			)}

		</form>
	)
}
