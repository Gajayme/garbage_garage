import {BorderedImage} from "Components/BorderedImage.js"
import {useObjectUrl} from "Components/MainPages/UploadPage/ImageManager/useObjectUrl.js"

import "Styles/MainPages/UploadPage/ImageManager/DeletableImage.scss"
import CrossIcon from "Assets/Icons/cross_gray.svg"


export const DeletableImage = ({
	image,
	onCrossClick,
	isDragging,
	setNodeRef,
	style,
	dragHandleProps,
}) => {
	// Картинки с сервера и из автозаполнения приходят с готовым `src`, добавленные
	// с диска — только с `file`: их превью строится из файла здесь, и blob-URL
	// освобождается вместе с этим компонентом — при удалении картинки из формы
	// любым способом и при размонтировании самой формы.
	const objectUrl = useObjectUrl(image.src ? null : image.file);
	const src = image.src || objectUrl;

	const containerClassName = [
		"deletable-image-container",
		isDragging ? "deletable-image-container--dragging" : "",
	].filter(Boolean).join(" ");

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={containerClassName}
			{...dragHandleProps}
		>
			{/* Без src BorderedImage подставил бы DefaultImg. */}
			{src && (
				<BorderedImage
					className="deletable-image"
					imageSrc={src}
					alt={image.alt || `Image ${image.id}`}
				/>
			)}
			<button
				type="button"
				className="cross-icon-button"
				aria-label="Delete"
				onClick={() => onCrossClick(image.id)}
			>
				<img src={CrossIcon} alt="" className="cross-icon" />
			</button>
		</div>
	)
};
