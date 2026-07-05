import React, {useRef, useState} from "react";
import {ImageUploader} from "./ImageUploader.js";
import {ImageViewer} from "./ImageViewer.js";
import {ErrorMessage} from "Components/MainPages/UploadPage/Validations/ErrorMessage.js"

import 'Styles/MainPages/UploadPage/Validations/ErrorText.scss'
import 'Styles/MainPages/UploadPage/ImageManager/ImageManager.scss'

export const ImageManager = ({images, errors, onAddFiles, onDelete, onDeleteSpecific, onReorder}) => {
	const [isDragging, setIsDragging] = useState(false);
	// Счётчик dragenter/dragleave: события всплывают с дочерних элементов,
	// поэтому простой boolean мерцает. Считаем глубину вложенности.
	const dragDepth = useRef(0);

	// Реагируем только на перетаскивание файлов из ОС. Внутренний drag
	// перестановки картинок (ImageViewer) не должен показывать оверлей
	// и вызывать onAddFiles.
	const isFileDrag = (event) =>
		Array.from(event.dataTransfer?.types || []).includes("Files");

	// Адаптер события скрытого <input type="file">: симметричен handleDrop,
	// оба сводят файлы к единому onAddFiles.
	const handleInputChange = (event) => {
		if (!event || !event.target) return;
		onAddFiles?.(event.target.files);
		event.target.value = null;
	};

	const handleDragOver = (event) => {
		event.preventDefault();
	};

	const handleDragEnter = (event) => {
		event.preventDefault();
		if (!isFileDrag(event)) return;
		dragDepth.current += 1;
		setIsDragging(true);
	};

	const handleDragLeave = (event) => {
		event.preventDefault();
		if (!isFileDrag(event)) return;
		dragDepth.current -= 1;
		if (dragDepth.current <= 0) {
			dragDepth.current = 0;
			setIsDragging(false);
		}
	};

	const handleDrop = (event) => {
		event.preventDefault();
		if (!isFileDrag(event)) return;
		dragDepth.current = 0;
		setIsDragging(false);
		onAddFiles?.(event.dataTransfer.files);
	};

	return (
		<div
			className={`image-manager${isDragging ? " image-manager--dragging" : ""}`}
			onDragOver={handleDragOver}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<ImageViewer onDeleteSpecific={onDeleteSpecific} onReorder={onReorder} images={images}/>
			<ImageUploader onChange={handleInputChange} onDelete={onDelete}/>
			<ErrorMessage className={"error-text"} errors={errors}/>
		</div>
	)
}
