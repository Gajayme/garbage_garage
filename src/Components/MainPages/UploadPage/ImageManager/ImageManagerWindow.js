import React from "react";
import {ImageManager} from "./ImageManager.js"
import {OuterWindow} from "Components/Window/OuterWindow.js"
import {InnerWindow} from "Components/Window/InnerWindow.js"
import {ButtonLayer} from "Components/Window/ButtonLayer.js"

import 'Styles/MainPages/UploadPage/Validations/ErrorText.scss'
import 'Styles/Window/WindowHeader.scss'
import 'Styles/Window/ButtonLayer.scss'
import 'Styles/Window/InnerWindow.scss'
import 'Styles/Window/OuterWindow.scss'

export const ImageManagerWindow = ({images, errors, onAddFiles, onDelete, onDeleteSpecific}) => {

	const buttonLayer = <ButtonLayer className="button-layer">
		<span>images</span>
	</ButtonLayer>

	const innerWindow = <InnerWindow className="inner-window">
		<ImageManager images={images} errors={errors} onAddFiles={onAddFiles} onDelete={onDelete} onDeleteSpecific={onDeleteSpecific}/>
	</InnerWindow>

	return (
		<OuterWindow className="outer-window-image-manager"
			buttonLayer={buttonLayer}
			innerWindow={innerWindow}>
		</OuterWindow>
	)
}
