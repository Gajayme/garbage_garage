import { ErrorMessage } from "./Validations/ErrorMessage.js";
import { CustomTextArea } from "Components/CustomTextArea.js";

import "Styles/MainPages/UploadPage/Labeled.scss";
import "Styles/MainPages/UploadPage/UploadPageTextArea.scss";
import "Styles/TopAndLeftBorders.scss";

/**
 * Поле textarea с заголовком и ошибками.
 */
export const LabeledTextArea = ({
	value,
	errors = null,
	onChange,
	id,
	labelText = "",
	className = "",
	maxLength = 0,
	inputValidator = null,
	placeholder = "",
	rows = 4,
}) => {
	return (
		<div className={`labeled ${className}`}>
			<label htmlFor={id}>{labelText}</label>

			<CustomTextArea
				value={value}
				onChange={onChange}
				id={id}
				maxLength={maxLength}
				className="upload-page-textarea top-and-left-borders"
				inputValidator={inputValidator}
				placeholder={placeholder}
				rows={rows}
			/>

			<ErrorMessage errors={errors} />
		</div>
	);
};
