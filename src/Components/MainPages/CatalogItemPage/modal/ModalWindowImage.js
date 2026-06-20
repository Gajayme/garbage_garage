import React from 'react';

import {BorderedImage} from "Components/BorderedImage.js"

import "Styles/MainPages/CatalogItemPage/ModalWindowImageCatalog.scss"
import CrossIcon from "Assets/Icons/cross_gray.svg"


export const ModalWindowImage = ({imageUrl, onCrossClick, onClick}) => {
	return (
		<div
			className="catalog-item-page-modal-container"
			onClick={onClick}
		>
			<BorderedImage
				className="catalog-item-page-modal-image"
				imageSrc={imageUrl}
				alt="enlarged"
			/>
			<button
				type="button"
				className="catalog-item-page-modal-close"
				aria-label="Close"
				onClick={() => onCrossClick()}
			>
				<img
					src={CrossIcon}
					alt="close"
					className="catalog-item-page-modal-cross-icon"
				/>
			</button>
		</div>
	)
};
