import {ErrorMessage} from "./Validations/ErrorMessage.js"
import {Dropdown} from "Components/DropDown.js"

import "Styles/MainPages/UploadPage/Labeled.scss";
import "Styles/CenteredText.scss";
import "Styles/MainPages/UploadPage/UploadPageInput.scss";
import "Styles/TopAndLeftBorders.scss";


/**
 * Компонент выпадающего списка с заголовком и списком ошибок.
 *
 * @param {object} props
 * @param {string|number|null} props.value - выбранная опция; null — пустой вариант.
 * @param {Array<[string, string|number]>} props.options - опции, которые будут доступны для выбора: пары [подпись, значение].
 * @param {string[]} props.errors - ошибки, которые будут отображены под выпадающим списком.
 * @param {string} props.id - id для связи заголовка с выпадающим списком. При клике на label будет выбран соответствующий список.
 * @param {string} props.labelText - заголовок.
 * @param {(value: string|null) => void} props.onChange - функция-обработчик изменений (значение — как у Dropdown).
 * @param {string} [props.className] - имя класса для стилизации.
 * @param {boolean} [props.disabled] - заблокировать выбор.
 */
export const LabeledDropdown = ({value, options, errors, id, labelText, onChange, className="", disabled}) => {
	return (
		<div className={`labeled ${className}`}>
			<label htmlFor={id}>{labelText}</label>
			<Dropdown value={value} options={options} id={id} onChange={onChange} className='upload-page-input top-and-left-borders' optionClassName= "centered-text" disabled={disabled} />
			<ErrorMessage errors={errors} />
		</div>
	);
};
