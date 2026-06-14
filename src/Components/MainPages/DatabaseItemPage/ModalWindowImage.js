import React from 'react';

import {BorderedImage} from "Components/BorderedImage.js"

import "Styles/MainPages/DatabaseItemPage/ModalWindowImageDatabase.scss"
import CrossIcon from "Assets/Icons/cross_gray.svg"


export const ModalWindowImage = ({imageUrl, onCrossClick, onClick}) => {
	return (
		<div
			className="database-item-page-modal-container"
			onClick={onClick}
		>
			<BorderedImage
				className="database-item-page-modal-image"
				imageSrc={imageUrl}
				alt="enlarged"
			/>
			<button
				type="button"
				className="database-item-page-modal-close"
				aria-label="Close"
				onClick={() => onCrossClick()}
			>
				<img
					src={CrossIcon}
					alt="close"
					className="database-item-page-modal-cross-icon"
				/>
			</button>
		</div>
	)
};
