import {ErrorMessage} from "./Validations/ErrorMessage.js";
import {CustomInput} from 'Components/CustomInput.js';

import 'Styles/MainPages/UploadPage/Labeled.scss';
import "Styles/MainPages/UploadPage/UploadPageInput.scss";
import "Styles/TopAndLeftBorders.scss";

/**
 * Компонент поля ввода с заголовком и ошибками.
 */
export const LabeledInput = ({
	value,
	errors = null,
	onChange,
	id,
	labelText = "",
	className = "",
	maxLength = 0,
	inputValidator = null,
	type = "text",
	placeholder = ""
}) => {
	return (
		<div className={`labeled ${className}`}>
			<label htmlFor={id}>{labelText}</label>

			<CustomInput
				value={value}
				onChange={onChange}
				id={id}
				maxLength={maxLength}
				className="upload-page-input top-and-left-borders"
				inputValidator={inputValidator}
				type={type}
				placeholder={placeholder}
			/>

			<ErrorMessage errors={errors}/>
		</div>
	);
};
