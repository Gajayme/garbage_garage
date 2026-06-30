import { useCallback, useMemo, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from "@tanstack/react-query";

import { DefaultButton } from "Components/Button.js"
import { NumbersOnly } from 'Components/utils/inputFilters.js'
import { FormDataLogger } from "Components/FormDataLogger.js";
import { UploadFormValidation } from './Validations/Validations.js'
import { NonEmpty, NonEmptyImages } from './Validations/Validations.js'
import { ImageManagerWindow } from "./ImageManager/ImageManagerWindow.js"
import { UploadNotificationState } from './UploadPageNotificationWindow.js'
import { LabeledInput } from "Components/MainPages/UploadPage/LabeledInput.js"
import { LabeledTextArea } from "Components/MainPages/UploadPage/LabeledTextArea.js"
import { LabeledDropdown } from "Components/MainPages/UploadPage/LabeledDropDown.js"
import { useInputParams } from "Components/hooks/useInputParams.js";
import { useAuth } from "Components/Auth/AuthContext.js";
import * as UploadConstants from "Components/MainPages/UploadPage/UploadPageConstants.js";
import { buildDropdownState, buildStatusDropdownState } from "Components/MainPages/UploadPage/buildDropdownState.js";
import { useHydrateUploadForm } from "Components/MainPages/UploadPage/useHydrateUploadForm.js";
import { normalizeFk, normalizeStatus } from "Components/MainPages/UploadPage/uploadFormNormalize.js";
import { revokeBlobImage, revokeBlobImages } from "Components/MainPages/UploadPage/imageBlobs.js";
import { urlToFile } from "Components/utils/urlToFile.js";

import * as Constants from 'Constants.js'

import 'Styles/MainPages/UploadPage/UploadPageForm.scss'
import 'Styles/MainPages/UploadPage/UploadPageButton.scss'
import DefaultImg from "Assets/Images/default.jpg"


// Стабильные пустые значения формы и ошибок — выносим на module scope,
// чтобы ссылки не пересоздавались на каждом рендере и можно было передавать
// в кастомные хуки без триггера их useEffect.
const INITIAL_FORM = {
	item_name: '',
	item_model: '',
	bought_for: '',
	price: '',
	buyers_part: '',
	sold_for: '',
	size: '',
	buyer: null,
	location: null,
	brand: null,
	type: null,
	status: null,
	description: '',
	images: [],
};

const INITIAL_ERRORS = Object.fromEntries(
	Object.keys(INITIAL_FORM).map((k) => [k, []])
);

// Маппер «поле → массив валидаторов». Зависит только от чистых функций-валидаторов,
// поэтому тоже выносим на module scope.
const VALIDATION_MAPPER = {
	item_name: [NonEmpty],
	bought_for: [NonEmpty],
	price: [NonEmpty],
	buyers_part: [NonEmpty],
	sold_for: [NonEmpty],
	size: [],
	buyer: [NonEmpty],
	location: [NonEmpty],
	brand: [NonEmpty],
	type: [NonEmpty],
	status: [NonEmpty],
	description: [NonEmpty],
	images: [NonEmptyImages],
};

// Декларативный конфиг дропдаунов. Статическая часть (имя поля формы, лейбл,
// id, плейсхолдер, билдер опций, ключ источника данных в useInputParams)
// Опции (`options`) добавляются внутри компонента через useMemo поверх этого
// конфига, потому что зависят от ответа useInputParams.
const DROPDOWN_DEFS = [
	{ name: "brand",    label: "Brand",    id: "brand_dropdown",
		dataKey: "brands",    placeholder: UploadConstants.chooseBrand,    builder: buildDropdownState },
	{ name: "type",     label: "Type",     id: "type_dropdown",
		dataKey: "types",     placeholder: UploadConstants.chooseType,     builder: buildDropdownState },
	{ name: "buyer",    label: "Buyer",    id: "buyer_dropdown",
		dataKey: "buyers",    placeholder: UploadConstants.chooseBuyer,    builder: buildDropdownState },
	{ name: "location", label: "Location", id: "location_dropdown",
		dataKey: "locations", placeholder: UploadConstants.chooseLocation, builder: buildDropdownState },
	{ name: "status",   label: "Status",   id: "status_dropdown",
		dataKey: "statuses",  placeholder: UploadConstants.chooseStatus,   builder: buildStatusDropdownState },
];

// Описание полей-инпутов (рендер ниже идёт через .map)
const INPUT_DEFS = [
	{ name: "item_name",   label: "Item Name",  id: "item_name_input",  maxLength: 50 },
	{ name: "item_model",  label: "Item Model", id: "item_model_input", maxLength: 50 },
	{ name: "buyers_part", label: "Buyer Part", id: "buyer_part_input", maxLength: 10, inputValidator: NumbersOnly },
	{ name: "bought_for",  label: "Bought for", id: "bought_for_input", maxLength: 10, inputValidator: NumbersOnly },
	{ name: "price",       label: "Price",      id: "price_input",      maxLength: 10, inputValidator: NumbersOnly },
	{ name: "sold_for",    label: "Sold for",   id: "sold_for_input",   maxLength: 10, inputValidator: NumbersOnly },
	{ name: "size",        label: "Size",       id: "size_input",       maxLength: 10 },
];

// Многострочные поля (textarea)
const TEXT_AREA_DEFS = [
	{
		name: "description",
		label: "Description",
		id: "description_textarea",
		maxLength: 2000,
		rows: 5,
	},
];



export const UploadPageForm = ({
	notificationStateSetter,
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

	// Локальные хелперы «покажи ошибку / покажи успех». Прячут конкретный enum
	// нотификаций (UploadNotificationState) — места вызова описывают намерение,
	// а не способ. Обёрнуты в useCallback, чтобы ссылки были стабильны и их
	// можно было передавать в кастомные хуки без перезапуска их useEffect.
	const showError = useCallback(
		() => notificationStateSetter(UploadNotificationState.ERROR),
		[notificationStateSetter]
	);
	const showSuccess = useCallback(
		() => notificationStateSetter(UploadNotificationState.SUCCESS),
		[notificationStateSetter]
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
				throw new Error(`Ошибка сервера: ${response.status}`);
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
			},
			errorLogPrefix: "upload error:",
		});
	};

	// обработчик отправки формы для редактирования
	const handleUpdateSubmit = async () => {
		if (!isEdit) return;

		await submitForm({
			url: `${Constants.base_server_url}${Constants.post_update}/${editItemId}`,
			method: Constants.http_methods.PUT,
			setBusy: setIsUpdating,
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: [Constants.itemsQueryKey],
				});
				await queryClient.invalidateQueries({
					queryKey: [Constants.itemsPrivateQueryKey],
				});
				await queryClient.invalidateQueries({
					queryKey: [Constants.itemDetailsPrivateQueryKey, editItemId],
				});
			},
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
		formData.append(Constants.item_name, formState.item_name);
		formData.append(Constants.item_model, formState.item_model);
		formData.append(Constants.bought_for, parseInt(formState.bought_for, 10));
		formData.append(Constants.price, parseInt(formState.price, 10));
		formData.append(Constants.buyer_part, parseInt(formState.buyers_part, 10));
		formData.append(Constants.sold_for, parseInt(formState.sold_for, 10));
		formData.append(Constants.item_size, formState.size);
		formData.append(Constants.buyer, parseInt(formState.buyer, 10));
		formData.append(Constants.location, parseInt(formState.location, 10));
		formData.append(Constants.brand, parseInt(formState.brand, 10));
		formData.append(Constants.type, parseInt(formState.type, 10));
		formData.append(Constants.status, formState.status ?? "");
		formData.append(Constants.description, formState.description);
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
		const normalize = key === "status" ? normalizeStatus : normalizeFk;
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

	// Автозаполнение всех полей для теста
	const handleOnTestAutofill = async () => {

		const imgFile = await urlToFile(DefaultImg, 'default.jpg')
		const imageObject = {
			id: uuidv4(),
			src: DefaultImg,
			file: imgFile,
		};

		setFormState({
			item_name: 'Кроссовки Adidas',
			item_model: 'Superstar',
			bought_for: '5000',
			price: '8500',
			buyers_part: '50',
			sold_for: '8000',
			size: '42',
			buyer: 1,
			location: 1,
			brand: 1,
			type: 1,
			status: "Initiated",
			description: 'Почти кархарт но вообще не совсем кархарт поэтому конечно кал вонючий',
			images: [imageObject]
		});
	};

	if (isLoading) {
		return (
			<p className="centered-text">{"Loading..."}</p>
		);
	}

	return (

		<form className="upload-page-form" onSubmit={handleOnSubmit}>

			<ImageManagerWindow
				images={formState.images}
				errors={errorState.images}
				onAddFiles={addImageFiles}
				onDelete={handleOnDeleteAllImages}
				onDeleteSpecific={handleOnDeleteSpecificImage}
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
				<DefaultButton
					className={"upload-page-button"}
					labelText={isEdit ? UploadConstants.buttonUploadAsNew : UploadConstants.buttonUpload}
					disabled={isBusy}
					type="submit"
					onClick={handleOnSubmit}
				/>
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

		</form>
	)
}
