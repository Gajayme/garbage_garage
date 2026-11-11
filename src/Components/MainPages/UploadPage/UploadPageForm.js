import { useMemo, useState } from "react"
import { v4 as uuidv4 } from 'uuid';

import { DefaultButton } from "Components/Button.js"
import { ImageManagerWindow } from "./ImageManager/ImageManagerWindow.js"
import { LabeledInput } from "Components/MainPages/UploadPage/LabeledInput.js"
import { LabeledTextArea } from "Components/MainPages/UploadPage/LabeledTextArea.js"
import { LabeledDropdown } from "Components/MainPages/UploadPage/LabeledDropDown.js"
import { useInputParams } from "Components/hooks/useInputParams.js";
import * as UploadConstants from "Components/MainPages/UploadPage/UploadPageConstants.js";
import { useHydrateUploadForm } from "Components/MainPages/UploadPage/useHydrateUploadForm.js";
import { useItemFormSubmit } from "Components/MainPages/UploadPage/useItemFormSubmit.js";
import { normalizeFk, normalizeStatus } from "Components/MainPages/UploadPage/uploadFormNormalize.js";
import { revokeBlobImage, revokeBlobImages } from "Components/MainPages/UploadPage/imageBlobs.js";
import { urlToFile } from "Components/utils/urlToFile.js";
import {
	INPUT_DEFS,
	DROPDOWN_DEFS,
	TEXT_AREA_DEFS,
	INITIAL_FORM,
	INITIAL_ERRORS,
} from "Components/MainPages/UploadPage/uploadFormFields.js";

import * as Constants from 'Constants.js'

import 'Styles/CenteredText.scss'
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

// Форма отправляется только кнопкой, Enter ничего не отправляет.
// Поэтому кнопка отправки — type="button": submit-кнопку браузер нажимает
// сам по Enter в любом текстовом поле. Без submit-кнопок браузер не отправляет
// форму по Enter, лишь пока в ней больше одного текстового поля; останется
// одно — отправит сам и перезагрузит страницу. Этот обработчик гасит такую отправку.
const preventNativeSubmit = (event) => event.preventDefault();


// Тексты уведомлений о результате отправки формы.
const mainTextSuccess = "success"
const mainTextError = "upload failed"



export const UploadPageForm = ({
	notificationSetter,
	editItemId,
}) => {

	// Есть editItemId — режим редактирования, иначе создание.
	const isEdit = Boolean(editItemId);


	// хук, который занимается загрузкой инпут параметров с сервера
	const { brands, types, buyers, locations, statuses, isLoading } = useInputParams();


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

	// стейты со значениями полей и ошибок (используем стабильные module-scope константы)
	const [formState, setFormState] = useState(INITIAL_FORM);
	const [errorState, setErrorState] = useState(INITIAL_ERRORS);

	// Локальные хелперы «покажи ошибку / покажи успех».
	const showError = () =>
		notificationSetter({ isError: true, text: mainTextError });
	const showSuccess = () =>
		notificationSetter({ isError: false, text: mainTextSuccess });

	// Гидрация (заполнение формы) данными вещи в edit-режиме.
	const { isHydrating, error: detailError } = useHydrateUploadForm({
		editItemId,
		paramsLoading: isLoading,
		setFormState,
		setErrorState,
		initialErrors: INITIAL_ERRORS,
	});

	// Сброс формы.
	// Объявлен до хука отправки потому что используется в нем.
	const resetForm = () => {
		revokeBlobImages(formState.images);
		setFormState(INITIAL_FORM);
		setErrorState(INITIAL_ERRORS);
	};

	// Отправка формы — создание или редактирование, по editItemId.
	const { submit, isBusy } = useItemFormSubmit({
		editItemId,
		formState,
		setErrorState,
		onCreated: resetForm,
		notifySuccess: showSuccess,
		notifyError: showError,
	});

	// Данные вещи не загрузились — редактировать нечего. Без этой ветки форма
	// покажет пустые поля и рабочую кнопку Save, которая отправит их поверх
	// вещи. Ранний return — после всех хуков, ниже только обычные функции.
	if (detailError) {
		return (
			<p className="centered-text">
				{detailError.status === 404
					? "Item not found"
					: "Error while loading item details"}
			</p>
		);
	}

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

	// Форма не рендерится, пока не пришло всё, чем её наполняют: справочники
	// и, в режиме редактирования, сама вещь. Иначе поля доступны для ввода
	// до гидрации, и пришедшие данные затирают уже напечатанное.
	if (isLoading || isHydrating) {
		return (
			<p className="centered-text">{"Loading..."}</p>
		);
	}

	return (

		<form className="upload-page-form" onSubmit={preventNativeSubmit} aria-busy={isBusy}>

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
					<DefaultButton
						className={"upload-page-button"}
						labelText={isEdit ? UploadConstants.buttonSave : UploadConstants.buttonUpload}
						disabled={isBusy}
						type="button"
						onClick={submit}
					/>
				</div>

				<DefaultButton labelText={'TEST AUTO FILL'} type="button" onClick={handleOnTestAutofill}/>

			</fieldset>

			{/* Слой, появляющийся поверх всего, пока пользователь ждет ответ от бекенда
			после нажатия на кнопку "загрузить" */}
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
