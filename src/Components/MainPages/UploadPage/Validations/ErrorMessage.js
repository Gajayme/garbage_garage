import "Styles/MainPages/UploadPage/Validations/ErrorText.scss";

export const ErrorMessage = ({errors}) => {
    return <div>
        {(errors && errors.length > 0) && <p className={"error-text"}>{errors[0]}</p>}
    </div>
}
