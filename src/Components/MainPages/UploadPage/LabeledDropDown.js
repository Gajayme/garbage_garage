import {ErrorMessage} from "./Validations/ErrorMessage.js"
import {Dropdown} from "Components/DropDown.js"

import "Styles/MainPages/UploadPage/Labeled.scss";
import "Styles/CenteredText.scss";
import "Styles/MainPages/UploadPage/UploadPageInput.scss";
import "Styles/TopAndLeftBorders.scss";


/**
 * Компонент выпадающего списка с заголовком и списком ошибок.
 *
 * Props:
 * @param {string} value - выбранная опция.
 * @param {string[]} options - опции, которые будут доступны для выбора.
 * @param {string[]} errors - ошибки, которые будут отображены под выпадающим списком.
 * @param {string} id - id для связи заголовка с выпадающим списком. При клике на label будет выбран соответствующий список.
 * @param {string} labelText - заголовок.
 * @param {Function} onChange - функция-обработчик изменений.
 * @param {string} className - имя класса для стилизации.
 */
export const LabeledDropdown = ({value, options, errors, id, labelText, onChange, className=""}) => {
	return (
		<div className={`labeled ${className}`}>
			<label htmlFor={id}>{labelText}</label>
			<Dropdown value={value} options={options} id={id} onChange={onChange} className='upload-page-input top-and-left-borders' optionClassName= "centered-text" />
			<ErrorMessage errors={errors} />
		</div>
	);
};
