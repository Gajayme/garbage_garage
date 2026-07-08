import React from 'react';

import {BorderedImage} from "Components/BorderedImage.js"

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
			<BorderedImage
				className="deletable-image"
				imageSrc = {image.src}
				alt={image.alt || `Image ${image.id}`}
			/>
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
