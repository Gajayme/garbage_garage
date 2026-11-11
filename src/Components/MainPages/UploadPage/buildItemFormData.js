import { FIELD_DEFS } from "Components/MainPages/UploadPage/uploadFormFields.js";
import * as Constants from "Constants.js";

/**
 * Тело multipart-запроса создания и редактирования вещи из состояния формы.
 *
 * Поля идут по FIELD_DEFS: имя на запись — `apiField`, если оно задано, значение
 * проходит через `serialize`, если он есть. Картинки уходят файлами под одним
 * ключом `Constants.files` в порядке галереи; элементы без `file` пропускаются.
 *
 * @param {object} formState - Состояние формы UploadPage.
 * @returns {FormData}
 */
export const buildItemFormData = (formState) => {
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
	return formData;
};
